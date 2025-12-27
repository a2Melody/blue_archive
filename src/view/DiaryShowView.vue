<script setup>
import { ref, onMounted } from "vue";
import Navigator from "@/components/Navigator.vue";
import Add from "@/components/colocate/Add.vue";
import Delete from "@/components/colocate/Delete.vue";
import DiaryLi from "@/components/colocate/DiaryLi.vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const previewHtml = ref("");        // HTML used for preview (includes <img> tags)
const diaries = ref([]);

// escape text to safe HTML
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

// load a diary and render preview with images resolved by attachmentId
async function loadDiary(id) {
  try {
    const url = `/api/diary/id/${id}`;
    const resp = await axios.get(url, { withCredentials: true });
    const data = resp && resp.data ? resp.data : null;

    if (!resp || (resp.status !== 200 && resp.status !== 201)) {
      alert("加载日记失败");
      return;
    }

    const result = data && data.data ? data.data : data;
    // Build HTML: title + divider + blocks rendered; for images, fetch presigned-get URL
    let parts = [];
    if (result && result.diary && result.diary.title) {
      parts.push(`<h3 class="diary-title">${escapeHtml(result.diary.title)}</h3>`);
      // divider between title and content
      parts.push(`<hr class="diary-divider" />`);
    }

    const blocks = Array.isArray(result.blocks) ? result.blocks : [];
    // resolve blocks sequentially or in parallel
    const blockHtmlPromises = blocks.map(async (b) => {
      if (b.type === "text") {
        // b.content is plain text with escaped '\n' sequences
        const raw = b.content || "";
        // unescape literal backslash-n into newline characters for correct rendering
        const withNewlines = raw.replace(/\\n/g, "\n");
        // escape HTML then convert newlines to <br>
        const safe = escapeHtml(withNewlines).replace(/\r\n|\n|\r/g, "<br>");
        return `<div class="diary-text">${safe}</div>`;
      } else if (b.type === "image") {
        const attachmentId = b.attachmentId || b.attachment_id || b.id;
        if (!attachmentId) {
          return `<div class="diary-image-fail">[图片: missing attachmentId]</div>`;
        }
        try {
          const r = await axios.get(`/api/attachments/${attachmentId}/presigned-get?expiry=300`, { withCredentials: true });
          const jr = r && r.data ? r.data : null;
          const url = jr && (jr.url || jr.data) ? (jr.url || jr.data) : null;
          if (url) {
            return `<div class="diary-image"><img src="${escapeHtml(url)}" alt="image" style="max-width:100%;height:auto" data-attachment-id="${escapeHtml(attachmentId)}"/></div>`;
          } else {
            return `<div class="diary-image-fail">[图片: 无法获取 url]</div>`;
          }
        } catch (e) {
          console.error("presigned-get error", e);
          return `<div class="diary-image-fail">[图片: 获取失败]</div>`;
        }
      } else {
        return `<div class="diary-unknown">${escapeHtml(JSON.stringify(b))}</div>`;
      }
    });

    const resolved = await Promise.all(blockHtmlPromises);
    parts = parts.concat(resolved);

    previewHtml.value = parts.join("\n");
  } catch (e) {
    console.error("loadDiary error:", e);
    if (e.response && e.response.status === 401) {
      alert("未认证，请先登录");
    } else {
      alert("加载失败");
    }
  }
}

// load current user's diary list
async function loadMyDiaryList() {
  try {
    const resp = await axios.get("/api/diary/getMyDiary", { withCredentials: true });
    const data = resp && resp.data ? resp.data : null;
    if (resp && (resp.status === 200 || resp.status === 201)) {
      diaries.value = data && data.data ? data.data : data || [];
    }
  } catch (e) {
    console.error("loadMyDiaryList error:", e);
  }
}

onMounted(() => {
  loadMyDiaryList();
});
</script>

<template>
  <Navigator />

  <div class="body_container">
    <Add @click="router.push('/diaryWriting')" />
    <Delete />
    <div class="diary_container">
      <DiaryLi
          v-for="d in diaries"
          :key="d.id"
          :title="d.title"
          :date="(d.createdAt || d.date || '').replace('T', ' ')"
          @click="loadDiary(d.id)"
      />
    </div>

    <div class="content_container" v-show="previewHtml !== ''" v-html="previewHtml"></div>
  </div>
</template>

<style scoped>
.body_container{
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to right, #CFDEF3, #E0EAFC);
  padding: 60px 150px 150px 150px;
  position: relative;
  user-select: none;
}
.diary_container{
  float: left;
  width: 500px;
  height: auto;
}
.content_container{
  float: left;
  width: 540px;
  min-height: 200px;
  margin-left: 120px;
  padding: 20px;
  background-color: #ffffff;
  white-space: normal;
  border-radius: 5px;
}
/* Title styling */
.diary-title{
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}
/* Divider between title and content */
.diary-divider{
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 8px 0 16px;
}
/* Text blocks */
.diary-text{
  margin: 6px 0;
  color: #222;
  line-height: 1.6;
}
/* Image container */
.diary-image{
  margin: 8px 0;
}
.diary-image img{
  display:block;
  max-width:100%;
  height:auto;
}
.diary-image-fail{
  color: #a00;
  margin: 6px 0;
}
</style>