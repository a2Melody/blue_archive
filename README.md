要是后端换IP的话得修改userChat.js和vite.config.js

需要-上传个性签名接口
    src/feature/Login/components/Login.vue  从后端拿数据调用user.setSignature更新个性签名
    src/common/components/Navigator.vue  使用上传接口+更新个性签名值

需要-该用户的历史记录接口
    src/stores/userChat.js      中写该接口，并放入messages中应该