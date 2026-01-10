要是后端换IP的话得修改userChat.js和vite.config.js

需要-上传个性签名接口
    src/feature/Login/components/Login.vue  从后端拿数据调用user.setSignature更新个性签名
    src/common/components/Navigator.vue  使用上传接口+更新个性签名值

需要-该用户的历史记录接口
    src/stores/userChat.js      中写该接口，并放入messages中应该

待确认-传过来的好友列表中的每个元素的status属性(表示离线或在线)能不能使用，以及是否为Boolean值

finished-点击同意或者不同意得重新更新待同意列表
finished-NEW_FRIEND_REQUEST 有一条新的好友申请（当前用户是接收方）
finished-ACCEPT_FRIEND_REQUEST 有一条好友申请通过（当前用户发起的好友申请）
finished-NEW_PRIVATE_MESSAGE 有一条新的私聊消息
USER_OFFLINE 你好友中有一个用户离线
USER_ONLINE 你好友中有一个用户在线（连接到websocket）
PRIVATE_MESSAGES_READ 有一个私聊中当前用户发出的信息被已读
REJECT_FRIEND_REQUEST 有一条好友申请被拒绝（同上）

待实现-删除好友界面-小框中嵌套小框
待实现-Momotalk中的小细节
待实现-Momotalk的开场动画
待实现-鼠标移动和点击的特效