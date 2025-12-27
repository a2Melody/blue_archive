<script setup>
import { ref, onMounted, nextTick } from "vue";
import useTools from "@/utils/diary-toolbar";
import { useRouter } from "vue-router";
import axios from "axios";

const {
  onBeforeInput,
  onCompositionStart,
  onCompositionEnd,
  isUndoDisabled,
  isRedoDisabled,
  editorRef,
  fileInputRef,
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onFileButtonClick,
  onInsertLocalImage
} = useTools();

const router = useRouter();

const diaryTitle = ref("");
const diaryId = ref(null);
const diaryVersion = ref(null);
const uploadProgress = ref(0);
const logLines = ref("");

// helper: append log
function appendLog(s) {
  logLines.value = new Date().toISOString() + "  " + s + "\n\n" + logLines.value;
}

// upload to presigned PUT (use fetch so axios interceptor won't modify external requests)
async function uploadToPresigned(putUrl, putHeaders, file, contentType) {
  const uploadHeaders = {};
  for (const k in putHeaders) {
    if (!Object.prototype.hasOwnProperty.call(putHeaders, k)) continue;
    uploadHeaders[k] = putHeaders[k];
  }
  uploadHeaders["Content-Type"] = contentType || (file && file.type) || "application/octet-stream";

  const uploadRes = await fetch(putUrl, {
    method: "PUT",
    headers: uploadHeaders,
    body: file
  });
  appendLog(`[uploadToPresigned] status=${uploadRes.status}`);
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => null);
    appendLog(`[uploadToPresigned] error body=${text}`);
    return { ok: false, text };
  }
  return { ok: true };
}

// Insert node at caret
function insertNodeAtCaret(node) {
  const editor = editorRef.value;
  if (!editor) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) {
    editor.appendChild(node);
    editor.appendChild(document.createElement("div"));
    return;
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.setEndAfter(node);
  sel.removeAllRanges();
  sel.addRange(range);
}

// presign -> upload -> complete -> insert preview + attach attachmentId
async function presignUploadAndInsertImage(file) {
  if (!file) return;
  try {
    const contentType = file.type || "application/octet-stream";
    const presignReq = { originalFilename: file.name || "pasted-image", mimeType: contentType };

    // 1) presign (DiaryController#presign)
    const presignResp = await axios.post("/api/diary/presign", presignReq, { withCredentials: true });
    const presignJson = presignResp && presignResp.data ? presignResp.data : null;
    appendLog(`[diary presign] status=${presignResp.status} body=${JSON.stringify(presignJson)}`);
    if (!presignResp || (presignResp.status !== 200 && presignResp.status !== 201)) {
      alert("presign 失败");
      return;
    }

    const attachmentId =
        (presignJson && (presignJson.attachmentId || presignJson.id)) ||
        (presignJson && presignJson.data && presignJson.data.attachmentId);
    const putUrl =
        (presignJson && (presignJson.putUrl || presignJson.url)) ||
        (presignJson && presignJson.data && presignJson.data.putUrl);
    const putHeaders =
        (presignJson && (presignJson.putHeaders || presignJson.headers)) ||
        (presignJson && presignJson.data && presignJson.data.putHeaders) ||
        {};

    if (!putUrl || !attachmentId) {
      alert("presign 返回不完整");
      return;
    }

    // 2) upload to presigned URL
    const uploadResult = await uploadToPresigned(putUrl, putHeaders, file, contentType);
    if (!uploadResult.ok) {
      alert("上传失败: " + (uploadResult.text || ""));
      return;
    }

    // 3) complete
    const completeResp = await axios.post("/api/attachments/complete", { attachmentId }, { withCredentials: true });
    appendLog(`[complete] status=${completeResp.status} body=${JSON.stringify(completeResp.data)}`);
    if (!completeResp || (completeResp.status !== 200 && completeResp.status !== 201)) {
      alert("complete 失败");
      return;
    }

    // 4) Insert preview and attach attachmentId
    const editorEl = editorRef.value;
    const existingBlobSrc = new Set();
    if (editorEl) {
      editorEl.querySelectorAll("img").forEach(i => {
        try { if (i.src && i.src.startsWith("blob:")) existingBlobSrc.add(i.src); } catch(e){}
      });
    }

    // insert preview via toolbar helper (keeps consistent styling/behavior)
    onInsertLocalImage(file);
    await nextTick();

    // find newly inserted image (a blob: URL that was not present before)
    if (editorEl) {
      const imgsAfter = Array.from(editorEl.querySelectorAll("img"));
      let targetImg = null;
      for (const imgEl of imgsAfter) {
        try {
          if (imgEl.src && imgEl.src.startsWith("blob:") && !existingBlobSrc.has(imgEl.src)) {
            targetImg = imgEl;
            break;
          }
        } catch (e) {}
      }
      if (!targetImg && imgsAfter.length) targetImg = imgsAfter[imgsAfter.length - 1];

      if (targetImg) {
        targetImg.dataset.attachmentId = String(attachmentId);
        targetImg.dataset.previewUrl = targetImg.src || "";
      } else {
        appendLog("[presignUploadAndInsertImage] 警告：无法找到刚插入的 img 来附加 attachmentId");
      }
    }

    appendLog(`Inserted image block with attachmentId=${attachmentId}`);
  } catch (err) {
    appendLog(`[presignUploadAndInsertImage] ${err && err.message ? err.message : err}`);
    alert("插入图片失败: " + (err && err.message ? err.message : err));
  }
}

/*
  Modified parseEditorToBlocks:
  - Save text blocks as plain text with newline characters escaped into the two-character sequence '\n'.
  - This keeps storage as pure text (no HTML), while preserving line breaks.
*/
function parseEditorToBlocks() {
  const blocks = [];
  let pos = 1;

  function escapeNewlines(s) {
    if (!s && s !== "") return "";
    return String(s).replace(/\r\n/g, "\n").replace(/\n/g, "\\n");
  }

  const editor = editorRef.value;
  if (!editor) return blocks;

  const topNodes = Array.from(editor.childNodes);
  for (const node of topNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      const imgEl = el.tagName.toLowerCase() === "img" ? el : el.querySelector("img");
      if (imgEl) {
        const aid = (imgEl.dataset && imgEl.dataset.attachmentId) ? String(imgEl.dataset.attachmentId) : null;
        blocks.push({
          blockId: null,
          type: "image",
          content: null,
          attachmentId: aid,
          metadata: null,
          position: pos++
        });
        continue;
      }
      // For text elements: use innerText to capture visible text with line breaks, then escape newlines
      const text = el.innerText || el.textContent || "";
      const escaped = escapeNewlines(text);
      blocks.push({
        blockId: null,
        type: "text",
        content: escaped,
        attachmentId: null,
        metadata: null,
        position: pos++
      });
    } else if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent || "";
      if (txt && txt.length > 0) {
        const escaped = escapeNewlines(txt);
        blocks.push({
          blockId: null,
          type: "text",
          content: escaped,
          attachmentId: null,
          metadata: null,
          position: pos++
        });
      }
    }
  }

  return blocks;
}

// render editor from blocks (text blocks: unescape '\n' into real newlines)
async function renderEditorFromBlocks(blocks) {
  const editor = editorRef.value;
  if (!editor) return;
  editor.innerHTML = "";
  for (const b of blocks) {
    if (b.type === "text") {
      const d = document.createElement("div");
      // unescape: turn literal backslash-n into newline characters
      const text = (b.content || "").replace(/\\n/g, "\n");
      d.textContent = text;
      editor.appendChild(d);
    } else if (b.type === "image") {
      const wrapper = document.createElement("div");
      const img = document.createElement("img");
      img.style.maxWidth = "60%";
      if (b.attachmentUrl) {
        img.src = b.attachmentUrl;
        if (b.attachmentId) img.dataset.attachmentId = String(b.attachmentId);
      } else if (b.attachmentId) {
        try {
          const r = await axios.get(`/api/attachments/${b.attachmentId}/presigned-get?expiry=300`, { withCredentials: true });
          const j = r && r.data ? r.data : null;
          const url = j && (j.url || j.data) ? (j.url || j.data) : null;
          if (url) img.src = url;
          img.dataset.attachmentId = String(b.attachmentId);
        } catch (e) { img.src = ""; }
      } else if (b.url) img.src = b.url || "";
      wrapper.appendChild(img);
      editor.appendChild(wrapper);
    }
  }
  renderPreviewFromEditor();
}

// preview render: read editor DOM and render preview; for text blocks we preserve newlines by using textContent -> innerHTML with <br>
function renderPreviewFromEditor() {
  const previewEl = document.getElementById("diaryPreview");
  if (!previewEl) return;
  previewEl.innerHTML = "";
  const children = Array.from((editorRef.value && editorRef.value.childNodes) || []);
  for (const n of children) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.textContent && n.textContent.trim()) {
        const p = document.createElement("div");
        p.textContent = n.textContent.trim();
        previewEl.appendChild(p);
      }
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      const elNode = n;
      const tag = elNode.tagName.toLowerCase();
      if (tag === "div" && elNode.querySelector("img")) {
        const imgEl = elNode.querySelector("img");
        const img = document.createElement("img");
        img.src = (imgEl && (imgEl.dataset.previewUrl || imgEl.src)) || "";
        img.style.maxWidth = "100%";
        previewEl.appendChild(img);
      } else {
        // for text blocks: get textContent (includes real newlines) and convert to HTML with <br>
        const txt = elNode.textContent || elNode.innerText || "";
        const escaped = (txt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const html = escaped.replace(/\r\n|\n|\r/g, "<br>");
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        previewEl.appendChild(wrapper);
      }
    }
  }
}

// save diary
async function onSave() {
  const btn = document.querySelector(".header_container .save");
  try {
    if (btn) btn.setAttribute("disabled", "true");
    const parsed = parseEditorToBlocks();
    appendLog("[save] parsed blocks: " + JSON.stringify(parsed));

    const missing = parsed.filter(b => b.type === "image" && !b.attachmentId);
    if (missing.length > 0) {
      alert("存在未上传图片（无 attachmentId），请使用 插入图片 或 粘贴图片重新插入或删除外链图片。");
      if (btn) btn.removeAttribute("disabled");
      return;
    }

    // build payload: text blocks contain escaped '\n' sequences (plain text)
    const blocksPayload = parsed.map(b => ({
      blockId: b.blockId || null,
      type: b.type,
      content: b.type === 'text' ? (b.content || '') : null,
      attachmentId: b.type === 'image' ? (b.attachmentId || null) : null,
      metadata: null,
      position: b.position
    }));

    const diary = {};
    if (diaryId.value) diary.id = diaryId.value;
    if (diaryVersion.value) diary.version = diaryVersion.value;
    diary.title = diaryTitle.value || "";

    const resp = await axios.post("/api/diary/save", { diary, blocks: blocksPayload }, { withCredentials: true });
    const data = resp && resp.data ? resp.data : null;
    appendLog(`[save] status=${resp.status} body=${JSON.stringify(data)}`);
    if (!resp || (resp.status !== 200 && resp.status !== 201)) {
      alert("保存失败，请查看日志");
      return;
    }

    const result = data && data.data ? data.data : data;
    if (result && result.diary) {
      diaryId.value = result.diary.id || diaryId.value;
      diaryVersion.value = result.diary.version || diaryVersion.value;
    }
    if (result && result.blocks && Array.isArray(result.blocks)) {
      await renderEditorFromBlocks(result.blocks);
    } else {
      renderPreviewFromEditor();
    }
    router.push('/diaryShow');
  } catch (err) {
    appendLog("[save] error: " + (err && err.message ? err.message : err));
    if (err.response && err.response.status === 401) {
      alert("未认证，请重新登录");
    } else {
      alert("保存失败: " + (err && err.message ? err.message : err));
    }
  } finally {
    if (btn) btn && btn.removeAttribute("disabled");
  }
}

// handler for file input change: only this handler will be attached to file input via template binding
async function onFileSelectedAndUpload(ev) {
  const input = ev.target;
  const file = input && input.files && input.files[0];
  if (!file) return;
  await presignUploadAndInsertImage(file);
  if (input) input.value = "";
}

// paste into editor: upload image
async function onPaste(ev) {
  if (!ev.clipboardData) return;
  const items = Array.from(ev.clipboardData.items || []);
  for (const it of items) {
    if (it.type && it.type.startsWith("image")) {
      const file = it.getAsFile();
      if (file) {
        ev.preventDefault();
        await presignUploadAndInsertImage(file);
      }
    }
  }
}

onMounted(() => {
  // no special init
});
</script>

<template>
  <div class="container">
    <div class="header_container">
      <button type="button" class="btn return" @click="router.push('/diaryShow')">返回</button>
      <button type="button" class="btn save" @click="onSave"><span>保存</span></button>
    </div>

    <div class="tool_container">
      <div class="w_edit_tool">
        <button :disabled="isUndoDisabled" @mousedown.prevent="onUndo"
                :style="{ color: isUndoDisabled ? '#bbb' : '#333', cursor: isUndoDisabled ? 'not-allowed' : 'pointer' }">
          <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64A510.272 510.272 0 0 0 149.984 213.984L0.032 64v384h384L240.512 304.48A382.784 382.784 0 0 1 512.032 192c212.064 0 384 171.936 384 384 0 114.688-50.304 217.632-130.016 288l84.672 96a510.72 510.72 0 0 0 173.344-384c0-282.784-229.216-512-512-512z"></path></svg>
        </button>
      </div>

      <div class="w_edit_tool">
        <button :disabled="isRedoDisabled" @mousedown.prevent="onRedo"
                :style="{ color: isRedoDisabled ? '#bbb' : '#333', cursor: isRedoDisabled ? 'not-allowed' : 'pointer' }">
          <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M0.00032 576a510.72 510.72 0 0 0 173.344 384l84.672-96A383.136 383.136 0 0 1 128.00032 576C128.00032 363.936 299.93632 192 512.00032 192c106.048 0 202.048 42.976 271.52 112.48L640.00032 448h384V64l-149.984 149.984A510.272 510.272 0 0 0 512.00032 64C229.21632 64 0.00032 293.216 0.00032 576z"></path></svg>
        </button>
      </div>

      <div class="split_line"></div>

      <div class="w_edit_tool" style="color:#bbb">
        <button disabled style="cursor: not-allowed"><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M64 512h384v128h-128V1024h-128V640h-128z m896-256H708.2496v768h-136.4992V256H320V128h640z"></path></svg></button>
      </div>

      <div class="w_edit_tool">
        <button @mousedown.prevent="onBold"><svg viewBox="0 0 1024 1024"><path d="M707.872 484.64A254.88 254.88 0 0 0 768 320c0-141.152-114.848-256-256-256H192v896h384c141.152 0 256-114.848 256-256a256.096 256.096 0 0 0-124.128-219.36zM384 192h101.504c55.968 0 101.504 57.408 101.504 128s-45.536 128-101.504 128H384V192z m159.008 640H384v-256h159.008c58.464 0 106.016 57.408 106.016 128s-47.552 128-106.016 128z"></path></svg></button>
      </div>

      <div class="w_edit_tool">
        <button @mousedown.prevent="onItalic"><svg viewBox="0 0 1024 1024"><path d="M896 64v64h-128L448 896h128v64H128v-64h128L576 128h-128V64z"></path></svg></button>
      </div>

      <div class="split_line"></div>

      <div class="w_edit_tool">
        <button @click="onFileButtonClick"><svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg></button>
      </div>

      <!-- hidden file input; template binding triggers our upload handler -->
      <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileSelectedAndUpload" />

      <div style="margin-left:8px">
        <div v-if="uploadProgress>0" class="progress"><i :style="{ width: uploadProgress + '%' }"></i></div>
      </div>
    </div>
  </div>

  <div class="scroll_container">
    <div class="content_container">
      <div class="title_container">
        <input v-model="diaryTitle" type="text" class="title_input" placeholder="未命名标题" />
      </div>

      <div class="edit_container">
        <div
            ref="editorRef"
            tabindex="0"
            contenteditable="true"
            class="edit"
            @beforeinput="onBeforeInput"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            @paste.prevent="onPaste"
            @input="renderPreviewFromEditor"
        >
        </div>
      </div>
    </div>
  </div>

<!--  <div style="padding:12px; max-width:910px; margin: 12px auto">
    <strong>预览：</strong>
    <div id="diaryPreview" class="preview"></div>
  </div>

  <div style="padding:12px; max-width:910px; margin: 12px auto">
    <strong>日志：</strong>
    <pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;padding:8px;height:160px;overflow:auto;border-radius:4px">{{ logLines }}</pre>
  </div>-->
</template>

<style scoped>
button, input, textarea{
  outline: none;
  border: none;
  background-color: transparent;
}
.container{ width: 100%; position: fixed; top: 0; }
.split_line{ width: 1px; height: 26px; background-color: #e3e3e3; }
.header_container{ display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding-right: 240px; width: 100%; height: 60px; background-color: #293646; border-radius: 15px 15px 0 0; }
.btn{ width: 58px; height: 32px; background-color: #00AFE8; color: white; border-radius: 3px; }
.btn:hover{ cursor: pointer; }
.save{ color: white; background-color: #00afe8; border: 1px solid #00afe8; }
.return{ color: black; background-color: #ececec; border: 1px solid #b3b3b3; }
.tool_container{ display: flex; align-items: center; gap: 8px; justify-content: center; width: 100%; height: 42px; padding: 3px 0; border-bottom:1px solid #ddd; color: #ddd; }
.w_edit_tool{ display: flex; justify-content: center; align-items: center; width: 34px; height: 34px; }
.w_edit_tool button{ width: 100%; height: 100%; }
.w_edit_tool svg{ width: 16px; height: 16px; }
.w_edit_tool:hover{ background-color: #f1f1f1; cursor: pointer; }
.scroll_container{ width:100%; margin-top: 126px;}
.content_container{ width: 910px; margin: 0 auto; box-shadow: 0 1px 4px rgba(0, 0, 0, .3); border-radius: 10px 10px 0 0; }
.title_input{ width: 910px; height: 50px; line-height: 50px; padding: 0 16px; font-size: 16px; color: #00AFE8; border-bottom: 0.6px solid #ddd; }
.title_input::placeholder{ color: #6BCBFF; }
.edit{ width: 910px; padding: 16px; font-size: 14px; min-height: 100vh; user-select: text; white-space: pre-wrap; }
.edit:focus{ outline: none; }
.progress{width:200px;height:8px;background:#eee;border-radius:4px;overflow:hidden}
.progress > i{display:block;height:100%;background:linear-gradient(90deg,#4facfe,#00f2fe);width:0%}
</style>