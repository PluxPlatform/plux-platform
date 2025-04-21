import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useUserStore } from "../../store/UserStore";
import type { User } from "../../api/user";

const UserManage: React.FC = () => {
  const { users, loading, addUser, updateUser, deleteUser } = useUserStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form] = Form.useForm();

  const filteredUsers = users.filter(
    (u) => u.username.includes(search) || u.email.includes(search)
  );

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    message.success("删除成功");
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success("编辑成功");
      } else {
        await addUser(values);
        message.success("新增成功");
      }
      setModalOpen(false);
    } catch {
      message.error("操作失败");
    }
  };

  return (
    <div className="flex-1">
      <Space>
        <Input.Search
          placeholder="搜索用户名或邮箱"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        columns={[
          { title: "用户名", dataIndex: "username" },
          { title: "邮箱", dataIndex: "email" },
          {
            title: "操作",
            render: (_, record: User) => (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
                <Popconfirm
                  title="确定删除吗？"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        dataSource={filteredUsers}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />

      <Modal
        title={editingUser ? "编辑用户" : "新增用户"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={editingUser || {}}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "邮箱格式不正确" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;
