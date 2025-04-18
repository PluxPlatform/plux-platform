import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo/logo_s.png";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "user", label: "人员管理" },
  { key: "menu", label: "菜单管理" },
  { key: "editor", label: "编辑器" },
];

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.split("/")[1] || "user";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-[#fff] text-[14px] flex justify-center items-center">
          <img src={logo} alt="logo" className="w-[60%] h-[60%]" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout>
        <Header className="flex justify-end items-center p-[24px] bg-[#fff]">
          <span>欢迎您，管理员</span>
        </Header>

        <Content className="flex m-[24px] mh-[200px]  bg-[#fff]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
