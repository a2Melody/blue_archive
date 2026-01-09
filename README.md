要是后端换IP的话得修改userChat.js和vite.config.js

需要-上传个性签名接口
    src/feature/Login/components/Login.vue  从后端拿数据调用user.setSignature更新个性签名
    src/common/components/Navigator.vue  使用上传接口+更新个性签名值

