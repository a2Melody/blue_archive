import { ref, computed } from 'vue';

export default function useTools() {
    const editorRef = ref<HTMLElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);

/*撤销和恢复功能*/
    const undoStack = ref<string[]>([]);
    const redoStack = ref<string[]>([]);
    const isComposing = ref(false);
    const isUndoDisabled = computed(() => undoStack.value.length === 0);
    const isRedoDisabled = computed(() => redoStack.value.length === 0);
    function pushHistory(editorEl: HTMLElement) {
        const current = editorEl.innerHTML;
        if (undoStack.value.length && undoStack.value[undoStack.value.length - 1] === current) return;
        redoStack.value.length = 0;
        undoStack.value.push(current);
        if (undoStack.value.length > 20) undoStack.value.shift();
    }
    function onCompositionStart() {               //composition事件：在输入法开始时保存一次快照，并标记composing
        isComposing.value = true;
        const editorEl = editorRef.value;
        if (editorEl) pushHistory(editorEl); // 保存 composition 开始前的状态
    }
    function onCompositionEnd() {                  // composition 结束后清除标志（beforeinput 阶段会被忽略，因为我们在 start 已保存）
        isComposing.value = false;
    }
    function onBeforeInput(e: InputEvent) {        // 最重要：beforeinput 事件在 DOM 改变前触发，适合保存变更前状态
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

    /*使用execCommand*/
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
    function onItalic() {
        const editorEl = editorRef.value;
        if (!editorEl) return;
        pushHistory(editorEl);
        editorEl.focus();
        document.execCommand('italic');
    }

    /*上传图片*/
    function onFileButtonClick() {
        fileInputRef.value?.click();
    }
    function onFileInputChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files && input.files[0];
        console.log('[fileInputChange] file:', file, 'input:', input);
        if (!file || !file.type || file.type.indexOf('image/') !== 0) {
            if (input) input.value = '';               // 重置选择，避免保留非图片文件
            return;
        }
        onInsertLocalImage(file);
        if (input) input.value = '';              // 清空 input，便于重复选择同一文件
    }
    function getRangeInEditor(editorEl: HTMLElement): Range | null {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        const common = range.commonAncestorContainer;
        if (!editorEl.contains(common)) return null;
        return range;
    }
    function setCaretAfter(node: Node) {
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    function onInsertLocalImage(file: File) {
        const editorEl = editorRef.value;
        if (!editorEl) return;
        console.log('[onInsertLocalImage] editorRef:', editorEl, 'file:', file);
        pushHistory(editorEl);
        if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
        const blobUrl = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.src = blobUrl;
        img.style.maxWidth = '60%';
        img.style.height = 'auto';
        const range = getRangeInEditor(editorEl);
        if (range) {
            range.deleteContents();
            range.insertNode(img);
            setCaretAfter(img);
        } else {
            editorEl.appendChild(img);
            setCaretAfter(img);
        }
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
        onFileButtonClick,
        onFileInputChange,
        onInsertLocalImage,
        onBeforeInput,
        onCompositionStart,
        onCompositionEnd,
    };
}