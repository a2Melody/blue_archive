import { ref, computed } from 'vue';

export default function useTools() {
    const isComposing = ref(false);
    const editorRef = ref<HTMLElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const undoStack = ref<string[]>([]);
    const redoStack = ref<string[]>([]);

    const isUndoDisabled = computed(() => undoStack.value.length === 0);
    const isRedoDisabled = computed(() => redoStack.value.length === 0);

    function pushHistory(editorEl: HTMLElement) {
        const current = editorEl.innerHTML;
        if (undoStack.value.length && undoStack.value[undoStack.value.length - 1] === current) return;
        redoStack.value.length = 0;
        undoStack.value.push(current);
        if (undoStack.value.length > 20) undoStack.value.shift();
    }
    // composition 事件：在输入法开始时保存一次快照，并标记 composing
    function onCompositionStart() {
        isComposing.value = true;
        const editorEl = editorRef.value;
        if (editorEl) pushHistory(editorEl); // 保存 composition 开始前的状态
    }

    function onCompositionEnd() {
        // composition 结束后清除标志（beforeinput 阶段会被忽略，因为我们在 start 已保存）
        isComposing.value = false;
    }

// 最重要：beforeinput 事件在 DOM 改变前触发，适合保存变更前状态
    function onBeforeInput(e: InputEvent) {
        const editorEl = editorRef.value;
        if (!editorEl) return;
        // 如果正在 IME 输入则忽略（compositionstart 已处理快照）
        if (isComposing.value) return;

        // 过滤掉不改变文本的输入类型（例如 format 之类），只在会改变内容的情况入栈
        // inputType 包含 'insertText', 'deleteContentBackward', 'insertParagraph' 等
        const t = (e as InputEvent).inputType || '';
        const important = (t.indexOf('insert') === 0) || (t.indexOf('delete') === 0) || t === 'insertParagraph';
        if (important) {
            pushHistory(editorEl);
        }
    }

    function getRangeInEditor(editorEl: HTMLElement): Range | null {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        const common = range.commonAncestorContainer;
        // common 可能是 text 节点，contains 接受 Node
        if (!editorEl.contains(common)) return null;
        return range;
    }
/*防止后面的字体*/
    function setCaretAfter(node: Node) {
        const sel = window.getSelection();
        if (!sel) return;

        // 创建一个“中性”容器，内含一个零宽空格字符
        const neutral = document.createElement('span');
        neutral.appendChild(document.createTextNode('\u200B'));

        // 明确覆盖可能被继承的格式，确保后续输入为正常样式
        neutral.style.fontWeight = 'normal';
        neutral.style.fontStyle = 'normal';
        neutral.style.textDecoration = 'none';
        neutral.style.color = 'inherit'; // 保持父级文本颜色，按需修改

        // 把中性节点插到 target node 之后
        node.parentNode?.insertBefore(neutral, node.nextSibling);

        // 将光标放到中性文本节点的末尾（文本长度为1）
        const range = document.createRange();
        const txt = neutral.firstChild as Text;
        range.setStart(txt, 1);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);

        // 注意：外层调用 wrapSelection 会执行 editorEl.focus()，确保编辑器获得焦点
    }

    function wrapSelection(editorEl: HTMLElement, styleCb: (span: HTMLSpanElement) => void) {
        const range = getRangeInEditor(editorEl);
        if (!range || range.collapsed) return false;
        pushHistory(editorEl);
        const wrapper = document.createElement('span');
        styleCb(wrapper);
        wrapper.classList.add('pending-format');
        try {
            range.surroundContents(wrapper);
            setCaretAfter(wrapper);
            editorEl.focus();
            return true;
        } catch (e) {
            // surroundContents 可能在跨节点选择时抛出，使用 extract/insert 的回退
            const frag = range.extractContents();
            wrapper.appendChild(frag);
            range.insertNode(wrapper);
            setCaretAfter(wrapper);
            editorEl.focus();
            return true;
        }
    }

    function onUndo() {
        const editorEl = editorRef.value;
        if (!editorEl || !undoStack.value.length) return;
        const prev = undoStack.value.pop()!;
        redoStack.value.push(editorEl.innerHTML);
        editorEl.innerHTML = prev;
    }

    function onRedo() {
        const editorEl = editorRef.value;
        if (!editorEl || !redoStack.value.length) return;
        const next = redoStack.value.pop()!;
        undoStack.value.push(editorEl.innerHTML);
        editorEl.innerHTML = next;
    }

    // 替换原来的 onBold 实现为：
    function onBold() {
        const editorEl = editorRef.value;
        if (!editorEl) return;
        // 保存变更前状态，保证 undo 可以回退
        pushHistory(editorEl);
        // 确保编辑器获得焦点（execCommand 依赖于 selection / focus）
        editorEl.focus();
        // 使用浏览器内建命令处理混合选择的加粗（兼容性好，行为一致）
        // 注意：execCommand 已被标记为废弃，但在主流浏览器仍可用且是最小可靠解
        document.execCommand('bold');
    }
    // 替换原来的 onItalic 实现为：
    function onItalic() {
        const editorEl = editorRef.value;
        if (!editorEl) return;
        pushHistory(editorEl);
        editorEl.focus();
        document.execCommand('italic');
    }
    function onColorChange(color: string) {
        const editorEl = editorRef.value;
        if (!editorEl || !color) return;
        wrapSelection(editorEl, span => { span.style.color = color; });
    }

    function onFileButtonClick() {
        fileInputRef.value?.click();
    }

    function onFileInputChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files && input.files[0];
        if (!file || !file.type || file.type.indexOf('image/') !== 0) {
            // 重置选择，避免保留非图片文件
            if (input) input.value = '';
            return;
        }
        onInsertLocalImage(file);
        // 清空 input，便于重复选择同一文件
        if (input) input.value = '';
    }

    function onInsertLocalImage(file: File) {
        const editorEl = editorRef.value;
        if (!editorEl) return;
        if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
        const blobUrl = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.src = blobUrl;
        img.style.maxWidth = '60%';
        img.style.height = 'auto';
        pushHistory(editorEl);
        const range = getRangeInEditor(editorEl);
        if (range) {
            range.insertNode(img);
        } else {
            editorEl.appendChild(img);
        }
        setCaretAfter(img);
    }

    return {
        editorRef,
        fileInputRef,
        onUndo,
        onRedo,
        undoStack,
        redoStack,
        isUndoDisabled,
        isRedoDisabled,
        onBold,
        onItalic,
        onColorChange,
        onFileButtonClick,
        onFileInputChange,
        onInsertLocalImage,
        onBeforeInput,
        onCompositionStart,
        onCompositionEnd,
    };
}