// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加按钮点击事件
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.addEventListener('click', function() {
        // 获取表单数据
        const formData = {
            item: document.getElementById('item').value,
            occurTime: document.getElementById('occurTime').value,
            type: document.getElementById('type').value,
            amount: document.getElementById('amount').value,
            remark: document.getElementById('remark').value
        };

        // 简单验证示例
        if (!formData.item || !formData.occurTime || !formData.amount) {
            alert('事项、发生时间、金额为必填项！');
            return;
        }
        // 提交事件
        document.getElementById('recordForm').submit()
    });
});