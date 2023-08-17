---
title: 使用 shell 一键搭建 macOS 前端环境
date: 2023-06-11 23:49:47
permalink: /pages/921342/
categories: 
  - 闲言碎语
  - 实用技巧
tags: 
  - 
titleTag: 草稿
---

一台新的 Mac 电脑，从零搭建前端开发环境可能需要耗费数小时的时间，不如把这些时间拿来摸鱼，搭建开发环境的事交给脚本来做。

本文会先讲，如果是手动配置开发环境，应该怎么做

并在下一章节提供全自动的解决方案。

解决方案的代码维护在 GitHub 仓库(链接)，欢迎 star/pr


<!-- more -->

# 环境搭建（手动）

软件安装和环境配置两个环节

## 软件安装

### 1. 安装 Chrome

```sh
# 检查 Chrome 是否安装
if [ -d /Applications/Google\ Chrome.app ]
then 
  echo "\033[0;32m[✓]\033[0m Chrome is already installed"
else 
  cd ~/Downloads
  curl https://dl.google.com/chrome/mac/stable/CHFA/googlechrome.dmg -o googlechrome.dmg --progress-bar
  # 挂载dmg, 并弹出弹窗 移入aplication
  hdiutil attach googlechrome.dmg
  cp -rf /Volumes/Google\ Chrome/Google\ Chrome.app /Applications
  if [ -d /Applications/Google\ Chrome.app ]
  then 
    echo "\033[0;32m[✓]\033[0m Chrome installs success"
  else 
    echo "\033[0;31m[×]\033[0m Chrome installs error"
  fi
fi
```

### 2. 安装 XCode

```sh
# check && install Xcode  gcc -v
# https://developer.apple.com/download/all/
if xcode-select -p 
then 
  echo "\033[0;32m[✓]\033[0m Xcode is already installed"
else 
  cd ~/Downloads
  echo "xcode commond line tools is downloading and will be installed soon，\033[0;32m[!] The computer password \033[0m is required during the installation process"
  # TODO 待确认地址是否正确
  curl https://download.developer.apple.com/Developer_Tools/Xcode_14.3.1/Xcode_14.3.1.xip -o xcode.dmg --progress-bar
  hdiutil attach xcode.dmg
  cd /Volumes/Command\ Line\ Developer\ Tools 
  sudo installer -pkg /Volumes/Command\ Line\ Developer\ Tools/Command\ Line\ Tools.pkg -target /
  if xcode-select -p
  then 
    echo "\033[0;32m[✓]\033[0m Xcode Command Line Tools installs success"
  else 
    echo "\033[0;31m[×]\033[0m  Xcode Command Line Tools installs error"
  fi
fi
```

### 3. 安装 VSCode

```sh
# check && install vscode
if [ -d /Applications/Visual\ Studio\ Code.app ]
then 
  echo "\033[0;32m[✓]\033[0m vscode is already installed"
else 
 cd ~/Downloads
 echo "vscode is downloading and will be installed soon"
 # TODO 下载最新版本
 curl https://vscode.cdn.azure.cn/stable/a0479759d6e9ea56afa657e454193f72aef85bd0/VSCode-darwin-stable.zip -o vscode.zip --progress-bar
 unzip -q ~/Downloads/vscode.zip 
 cp -rf ~/Downloads/Visual\ Studio\ Code.app /Applications
 rm -rf ~/Downloads/Visual\ Studio\ Code.app
 if [ -d /Applications/Visual\ Studio\ Code.app ]
 then 
   echo "\033[0;32m[✓]\033[0m vscode installs success"
   cat << EOF >> ${HOME}/.zshrc
 export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"
EOF
source ${HOME}/.zshrc
# 安装常用的 VSCode 拓展
 code --install-extension  eamodio.gitlens
 else 
   echo "\033[0;31m[×]\033[0m vscode installs error" 
 fi
fi
```

## 环境配置

### 1. 安装 Node 环境

```sh
command_exists() {
	command -v "$@" >/dev/null 2>&1
}

# install nvm & node
if command_exists node 
then
  echo "\033[0;32m[✓]\033[0m node is already installed"
else
  echo "nvm is downloading & node is going to install"
  # TODO 安装最新版本
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
  if [ ! -f "${HOME}/.zshrc" ] 
  then 
    touch ${HOME}/.zshrc # 文件不存在创建, 否则继续执行下面
  fi
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

  echo '\nexport NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm' >> ${HOME}/.zshrc
  source ${HOME}/.zshrc

  nvm install --lts
  nvm use --lts
  if command_exists node 
  then
    echo "\033[0;32m[✓]\033[0m node installs success"
  else 
    echo "\033[0;31m[×]\033[0m node installs error, nvm installs error"
  fi
fi
```

### 2. 配置 npm

```sh
# TODO 可以自由选择其他镜像源 
registry=$(npm config get registry)
# 默认是 https://registry.npmjs.org/
if [ "$registry" = "https://registry.npm.taobao.org/" ]; then
    echo "\033[0;32m[✓]\033[0m NPM registry pointing to taobao"
else
npm config set registry https://registry.npm.taobao.org/
echo "\033[0;32m[✓]\033[0m NPM registry pointing to taobao"
fi
# TODO yarn/pnpm 配置
```

### 3. 配置 Git 以及 GitHub

```sh
# 配置gitlab
if ls -al ~/.ssh
then
 if [ -f ~/.ssh/id_rsa.pub ]
 then 
   echo "ssh公钥存在"
   cat ~/.ssh/id_rsa.pub
   echo "=================================复制公钥到 \033[0;32mhttps://github.com/settings/keys \033[0m ============"
 else 
   echo -n "Enter your Email:"
   read  email
   ssh-keygen -t rsa -C $email
   cat ~/.ssh/id_rsa.pub
   echo "=================================复制公钥到 \033[0;32mhttps://github.com/settings/keys \033[0m ============"
 fi
else
  echo "\033[0;32m[!]\033[0m 需要配置ssh"
  echo -n "Enter your name:"
  read  name
  echo -n "Enter your email:"
  read  email
  ssh-keygen -t rsa -C $email
  git config --global user.name $name  
  git config --global user.email $email
  if [ -f ~/.ssh/id_rsa.pub ]
  then 
   echo "ssh公钥如下"
   cat ~/.ssh/id_rsa.pub
   echo "=================================复制公钥到 \033[0;32mhttps://github.com/settings/keys \033[0m ============"
  fi
  echo "\033[0;32m[✓]\033[0m hello $name, $email, 已经给您配置本地git中"
fi

```

# 环境搭建（自动）

执行

```sh
# TODO 确定地址，github CDN
sh -c "$(curl -fsSL https://xxx//fe-init.sh)"
```

如果不放心链接内容，或者链接访问不通，可以复制以下内容保存到本地（my.sh），然后重新执行 sh 命令
```sh
sh my.sh
```

`fe-init.sh` 完整内容如下：

```sh
#！/bin/bash


 echo '=================================运行完毕，恭喜您环境已准备就绪, 可以开始开发======================'
 echo '=================================下面是可选安装应用，可以根据需要来选择安装======================'
reg_num_str='^[0-9]+(,[0-9]+)*$'



prompt="Enter an option (多个用 英文逗号 相隔如1,2 数字 6 直接退出): "
# TODO 加入最新的 Vite/Next 等？
files=("charles" "iterm2" "yarn" "pnpm" "homebrew" "Quit")

menuitems() {
    echo "Avaliable apps:"
    for i in ${!files[@]}; do
       printf "%3d) %s\n" $((i+1))  "${files[i]}"
    done
}

menuitems
while read -rp "$prompt" num && [[ "$num" ]]; do
   if [[ "$num" =~ $reg_num_str ]];
   then
     arr=(`echo $num | tr ',' ' '`)
     echo $num
     # 6 退出
     if [[ ${#arr[@]} == 1 && $num == ${#files[@]} ]];then
      break;
     elif [[ ${#arr[@]} == 1 &&  ($num -gt ${#files[@]} || $num -le 0) ]]; then
      echo "Invalid option: ${num}"; 
      continue;
     else 
      break;
     fi
   else
     echo "Invalid option: ${num}"; 
     continue;
   fi
done

    for i in ${!arr[@]}; do
    tmp=`expr ${arr[i]} - 1`;
    [[ "${choices[tmp]}" ]] && choices[tmp]="" || choices[tmp]=${files[tmp]}
    done
    unset tmp
if [[ ${#choices[@]} -ge 1 ]]; then
  echo "You selected ${choices[@]}"
else
  echo "You selected nothing"
fi


# 开始安装遍历
for i in ${!choices[@]}; do
  case ${choices[i]} in
         "charles") 
            if [ -d /Applications/Charles.app ]
            then 
             echo "\033[0;32m[✓]\033[0m charles is already installed"
            else 
             echo "charles is downloading and will be installed soon. \033[0;32m[!] A license agreement will appear before the installation, and you need to press Enter until you need to enter "Y" \033[0m"
             cd ~/Downloads
             curl https://www.charlesproxy.com/assets/release/4.5.6/charles-proxy-4.5.6.dmg -o charles.dmg --progress-bar
             hdiutil attach charles.dmg
             cp -rf /Volumes/Charles\ Proxy\ v4.5.6/Charles.app  /Applications
             if [ -d /Applications/Charles.app ]
             then 
               echo "\033[0;32m[✓]\033[0m charles install success"
             else 
               echo "\033[0;31m[×]\033[0m charles install error"
             fi
          fi
        ;;
        "iterm2")
          if [ -d /Applications/iTerm.app ]
           then 
             echo "\033[0;32m[✓]\033[0m iTerm2 is already installed"
           else 
             cd ~/Downloads
             echo "iterm2 is downloading and will be installed soon"
             curl https://iterm2.com/downloads/stable/iTerm2-3_3_12.zip -o item2.zip --progress-bar
             unzip -q ~/Downloads/item2.zip
             cp -rf ~/Downloads/iTerm.app /Applications 
             # 移动完之后删除
             rm -rf ~/Downloads/iTerm.app
             if [ -d /Applications/iTerm.app ] 
               then 
               echo "\033[0;32m[✓]\033[0m iTerm2 installs success, install oh-my-zsh start"
               # TODO item 配置脚本
               echo '\nexport NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm' >> ${HOME}/.zshrc
               cat << EOF >> ${HOME}/.zshrc
 export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"
EOF
               # echo 'ZSH_THEME="agnoster"' >> ${HOME}/.zshrc
               source ${HOME}/.zshrc
             else 
               echo "\033[0;31m[×]\033[0m iTerm2 installs error"
             fi
           fi
         ;;
         "yarn") 
            if yarn -v
            then 
              echo "\033[0;32m[✓]\033[0m yarn already installed"
            else 
              echo "yarn is installing"
              npm install -g yarn 
              node_stderr=$(yarn -v 2>&1)
              if [[ "$node_stderr" == *"permission"* ]]; then
                 sudo chown -R ${USER} ${HOME}/.config
                 if yarn -v
                 then 
                  echo "\033[0;32m[✓]\033[0m yarn installs success"
                 else  
                   echo "\033[0;31m[×]\033[0m yarn installs error"
                 fi
             else 
                echo $node_stderr
            fi
                unset node_stderr
           fi
          ;;
          "pnpm")
             if command_exists pnpm
            then 
              echo "\033[0;32m[✓]\033[0m pnpm already installed"
            else
              echo "pnpm is installing"
              npm install -g pnpm 
              if pnpm --version
              then 
               echo "\033[0;32m[✓]\033[0m pnpm installs success"
              else 
               echo "\033[0;31m[×]\033[0m pnpm installs error"
              fi
            fi
          ;;
          "homebrew")
             if command_exists brew
             then 
               echo "\033[0;32m[✓]\033[0m brew already installed"
             else
               echo "homeBrew is installing and \033[0;32m[!] The computer password \033[0m is required during the installation process"
               curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh | bash
               if command_exists  brew 
               then 
                echo "\033[0;32m[✓]\033[0m brew installs success"
               else 
                echo "\033[0;31m[×]\033[0m brew installs error"
               fi 
              fi
          ;;
        *) break
esac
done
echo "=================================运行完毕，恭喜您环境已准备就绪, 可以开始开发======================"
```



# 总结

本文提供了手动和自动两种搭建

但都是基于 shell 命令，不够直观，后续会开发一个带 UI 的工具，敬请期待

# 拓展阅读

- [一个常用的mac新机前端开发环境配置指南(带shell脚本)](https://juejin.cn/post/6867457249342652430)
- [tea.xyz-一款包管理器](https://github.com/teaxyz/cli)
- [云谦-如何从0开始配置 Mac](https://mp.weixin.qq.com/s/sdBZTSOzm94Zopgr_OijOg)