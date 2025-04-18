import React from "react";
import { Form, Input, Button, Checkbox, Card, message } from "antd";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = () => {
    // 模拟登录
    message.success("登录成功");
    navigate("/");
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card title="登录" style={{ width: 350 }}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
            <Button type="link" block onClick={() => navigate("/register")}>
              没有账号？去注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
