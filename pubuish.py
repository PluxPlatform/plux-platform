#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import subprocess
import sys

def run_command(command):
    """执行命令并打印输出"""
    print(f"执行命令: {command}")
    process = subprocess.run(command, shell=True, check=True)
    return process.returncode == 0

def update_version(package_path):
    """更新 package.json 中的版本号"""
    try:
        with open(package_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
        
        current_version = package_data['version']
        print(f"当前版本: {current_version}")
        
        # 分割版本号
        version_parts = current_version.split('.')
        major = int(version_parts[0])
        minor = int(version_parts[1])
        patch = int(version_parts[2])
        
        # 增加补丁版本号
        patch += 1
        new_version = f"{major}.{minor}.{patch}"
        print(f"新版本: {new_version}")
        
        # 更新版本号
        package_data['version'] = new_version
        
        # 写回文件
        with open(package_path, 'w', encoding='utf-8') as f:
            json.dump(package_data, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"更新版本号时出错: {e}")
        return False

def main():
    """主函数"""
    package_path = 'package.json'
    
    # 检查 package.json 是否存在
    if not os.path.exists(package_path):
        print(f"错误: 找不到 {package_path} 文件")
        sys.exit(1)
    
    # 1. 执行 npm build
    print("开始构建项目...")
    if not run_command("npm run build"):
        print("构建失败")
        sys.exit(1)
    
    # 2. 更新版本号
    print("更新版本号...")
    if not update_version(package_path):
        print("更新版本号失败")
        sys.exit(1)
    
    # 3. 执行 npm publish
    print("发布新版本...")
    if not run_command("npm publish"):
        print("发布失败")
        sys.exit(1)
    
    print("发布完成!")

if __name__ == "__main__":
    main()