---
title: LearningLinux
date: 2017-02-14 17:11:23
permalink: /pages/ee0cfb/
categories: 
  - 通用技术
  - Linux
tags: 
  - 
titleTag: 草稿
---
[TOC]

# 基本指令

## 指令xxx --help 

显示指令 xxx 的使用方式。学习指令最佳方式

## pwd

显示当前所处目录绝对路径

# 文件操作

在 linux 中，文件夹也属于文件

## 创建文件夹 mkdir

- `-m --mode` 指定该文件夹的权限 e.g. : `mkdir -m 770 a` 创建了770权限的 a 文件夹
  > 没有设置权限的话，目录默认权限是 `rwx - umask`

- `-p --parents`  **嵌套**创建文件夹  e.g. : `mkdir -p a/b` 在当前文件夹下创建a文件夹，a文件夹下创建b文件夹。 且如果任意一层文件夹存在，不会报错。

- `-v --verbose` 创建目录成功会有提示：`mkdir: 已创建目录 "xxx"`。 没什么用

- `-Z` 设置安全上下文，与SELinux有关，一般用不到

综合示例：创建项目结构命令
```sh
mkdir -vp scf/{lib/,bin/,doc/{info,product},logs/{info,product},service/deploy/{info,product}}
# 输出：
mkdir: created directory ‘scf’
mkdir: created directory ‘scf/lib/’
mkdir: created directory ‘scf/bin/’
mkdir: created directory ‘scf/doc’
mkdir: created directory ‘scf/doc/info’
mkdir: created directory ‘scf/doc/product’
mkdir: created directory ‘scf/logs’
mkdir: created directory ‘scf/logs/info’
mkdir: created directory ‘scf/logs/product’
mkdir: created directory ‘scf/service’
mkdir: created directory ‘scf/service/deploy’
mkdir: created directory ‘scf/service/deploy/info’
mkdir: created directory ‘scf/service/deploy/product’
```

## 删除文件(夹)： rm [选项]... 文件...

- `-f, --force`        强制删除文件或目录(用于删除有内容的文件)
- `-i`            每次删除都要确认[y + Enter]
- `-I `                   删除超过三个文件或者递归删除时会提醒一次，比起 -i更少打扰
- `--no-preserve-root `  照删 '/' 目录
- `--preserve-root`   do not remove '/' (默认  防止误删)
- `-r, -R`  递归处理，将指定目录及目录下所有东西删除
- `-d, --dir `       删除空目录
- `-v, --verbose `      打印处理过程


## 创建文件： vim

### 说明

处于命令模式时，输入的指令会暂存到寄存器，每输入一个字符会进行一次正则匹配(无效字符自动过滤)，成功则执行指令并清空寄存器

字由字母数字下划线组成，即正则中的 `\w` ，等同于：`[a-zA-Z0-9_]`

### 一、进入/退出 vim的命令

用法:
- `vim [参数] [文件 ..]  `      编辑指定的文件
- `vim [参数] -  `             从标准输入(stdin)读取文本
- `vim [参数] -t tag   `       编辑 tag 定义处的文件
- `vim [参数] -q [errorfile] ` 编辑第一个出错处的文件

常用参数：
- `+` 启动后跳到文件末尾
- `+<lnum>` 启动后跳到第 lnum 行
- `+/<pattern>` 启动后将光标置于第一个与 `pattern` 匹配的串处
- `-r` 在上次正用 vi 编辑时发生系统崩溃，恢复filename

退出命令：
- `ZZ`  退出vi并保存
- `:q!` 退出vi，不保存
- `:wq` 退出vi并保存

### 二、常用移动光标类命令

- `h` ：光标左移一个字符【习惯用 `←` or `backspace` 】
- `l` ：光标右移一个字符【习惯用 `→` or `sapce` 】
------
- `k 或 Ctrl+p`：光标上移一行【习惯用 `↑` 】
- `j 或 Ctrl+n` ：光标下移一行【习惯用 `↓` or `Enter` 】
------
- `w 或 W` ：光标右移一个字至字首
- `b 或 B` ：光标左移一个字至字首
- `e 或 E` ：光标右移一个字至字尾
------
- `nG` ：光标移至第 n 行首,注：没有第0行的概念
- `n$` ：光标移至第 n 行尾
- `n+` ：光标下移 n 行【习惯用 `n↓` 】
- `n-` ：光标上移 n 行【习惯用 `n↑` 】
------
- `0 或 home` ：（注意是数字零）光标移至当前行首
- `$ 或 end `：光标移至当前行尾 
------
- `H` ：光标移至屏幕(非文本)顶行
- `M` ：光标移至屏幕中间行
- `L` ：光标移至屏幕最后行
------
- `gg` ：移动到页首，文档的第一行
- `G` ：移动到页末，文档的最后一行
------
- `)` ：光标移至下一句句首 匹配句子接受符号：. ? ! 等
- `(` ：光标移至上一句句首
- `}` ：光标移至下一段落开头 匹配空行而不是`\n` ,就目前测试来说
- `{` ：光标移至上一段落开头

### 三、重复操作

- `.` ：重复上一次指令，某些指令无效

　　
### 四、自动补齐

**输入模式**下，使用以下命名会进行自动补齐，存在多个会列表展示
> vi 不支持， vim 才可以

- `Ctrl+p` ：向前查找匹配上一个选项
- `Ctrl+n` ：向后查找匹配下一个选项


### 五、行合并

- `J` ：把下面一行合并到本行后面


### 六、屏幕翻滚类命令

屏幕翻滚，光标位置不变，除非屏幕翻滚后原光标所在处不可视，此时会重新设置光标

- `Ctrl+e` ：将屏幕上滚一行
- `Ctrl+y` ：将屏幕下滚一行
- `Ctrl+u` ：将屏幕上滚半屏
- `Ctrl+d` ：将屏幕下滚半屏
- `Ctrl+b` ：将屏幕上滚半屏
- `Ctrl+f` ：将屏幕下滚半屏
-----
- `z enter` ：将当前行滚至屏幕顶行
- `nz enter` ：将第 n 行滚至屏幕顶行
- `z.` ：将当前行滚至屏幕的中央
- `nz.` ：将第 n 行滚至屏幕的中央
- `z-` ：将当前行置为屏幕的底行
- `nz-` ：将第 n 行滚至屏幕的底行

### 七、编辑文本类命令

> 插入模式：输入文本新增到当前光标之后

> 替换模式：输入文本替换当前光标之后的文本，输入多少文本替换多少。

- `i` ：在光标前进入插入模式
- `a` ：在光标后进入插入模式【最常用】
- `I` ：在当前行首进入插入模式
- `A` ：在当前行尾进入插入模式
----
- `o` ：在光标下方新开一行并将光标置于新行行首，进入插入模式。
- `O` ：同上，在光标上方。
----

- `r` ：替换当前字符,先按 r 再按其他字符可以替换当前字符，仍处于命令模式
- `R` ：进入替换模式
- `~` ：更改当前光标下字符的大小写，之后光标向后移动，仍处于命令模式


### 八、删除命令


- `x` ：删除光标后一个字符(这边的光标指的是当前字符左部)
- `X` ：删除光标前一个字符
- `s` ：删除当前光标字符，并进入插入模式
- `S` ：删除当前行所有字符，并进入插入模式
----
- `dw` ： 删除当前字剩余部分（及其后的空白符） 
- `ndw 或 ndW` ：删除当前字剩余部分及其后的n-1个字（及其后的空白符） 
- `cw` ： 删除当前字剩余部分，并进入插入模式
- `ncw 或 nCW` ：删除当前字剩余部分及其后的n-1个字，并进入插入模式
----
- `d0` ：删至行首
- `d$` ：删至行尾
----
- `dd` ：删除当前行
- `ndd` ：删除当前行及其后n-1行
- `cc` ：删除当前行，并进入插入模式
- `ncc` ：删除当前行及其后n-1行，并进入插入模式

- `d + ↑` ：删除当前行和上一行，其他命令（nd/c/nc）类似
- `d ↓ 或 d enter` ：删除当前行和下一行，其他命令（nd/c/nc）类似




### 九、搜索及替换命令

支持正则，若需要查找 `.*[]^%~$` 这些字符需要加上转义字符 `\`

- `/pattern` ：从光标开始处向文件**尾**搜索 pattern
- `?pattern` ：从光标开始处向文件**首**搜索 pattern
- `%` ：查找配对的括号。光标处于括号处，使用该命令后光标跳到匹配的括号那边
- `n` ：在同一方向重复上一次搜索命令
- `N` ：在反方向上重复上一次搜索命令
----
- `:s/p1/p2/g` ：将当前行中所有 p1 用 p2 替代
- `:n1,n2s/p1/p2/g` ：将 n1~n2 行中所有 p1 用 p2 替代
- `:g/p1/s//p2/g` ：将文件中所有 p1 用 p2 替换



查找选项：

1. 设置高亮

- `:set hlsearch` ：设置高亮

- `:set nohlsearch` ：关闭高亮

- `:nohlsearch` ：取消当前匹配项的高亮

2. 增量查找
> 增量查找会实时匹配查找项，更新预览内容，并移动光标；默认关闭

- `:set incsearch` ：设置增量查找

- `:set noincsearch` ：关闭增量查找

### 十、撤销重做

在 vi 中，撤销重做针对的是操作。在编辑模式下连续对一行进行的所有动作算是一个操作

- `u` ：撤销操作
- `U` ：撤销/重做最后一次操作
- `Ctrl+r` ：重做操作

值得注意的是，在单行进行多次动作，无法对单个动作进行撤销重做，也可能我不知道？

### 十一、复制粘贴块操作

vim 支持个剪贴板， 分别为 `0、1、...9、a、"`

`" 剪贴板` 为默认剪贴板，复制剪切时未指定剪切板号，内容将复制到该剪切板中

如果开启了系统剪贴板，`+、*` 为系统剪贴板，通过以下指令判断是否开启
```sh
vim --version | grep clipboard 
#  +clipboard 表示开启；-clipboard 表示未开启
```
如何开启以及两个剪贴板区别详见 [vim 系统剪贴板-知乎](
https://www.zhihu.com/question/19863631/answer/442180294)

选块：
- `v` ：任意选择
- `Ctrl+v` ：垂直选择
- `V` ：整行选择
----
复制(yank)：
- `y` ：复制
- `yl` ：复制当前字符
- `yw` ：复制当前字剩余部分（及其后的空白符）
- `yy 或 Y` ：复制当前整行
- `nyl` ：复制当前光标其后的n个字符（仅复制当前行字符）
- `nyw` ：复制当前字剩余部分及其后的 n-1个字（及其后的空白符）
- `nyy` ：复制当前行开始的n行内容
- `y$` ：从当前位置复制到行尾
- `y0` ：从当前位置复制到行首
- `y^` ：从当前位置复制到第一个非空白字符
- `yG` ：从当前行复制到文件结束
- `y20G` ：从当前行复制到第20行
- `y?bar enter` ：复制至上一个出现bar的位置
- `Ny` ：复制内容到 N 剪贴板，这里的 N 为 `" + 剪切板号`; 其他复制指令前加 N 同理
-----
粘贴（put）：
- `p` ：在光标之后粘贴内容
- `P` ：在光标之前粘贴内容
- `Np` ：粘贴 N 剪贴板 内容，这里的 N 为 `" + 剪切板号`; `NP` 同理
-----
剪切（delete）：
- `d` ：剪切

其他指令和复制同理， d 替换 y ，复制效果变为剪切效果


- `:reg` ：查看剪贴板内容

### 十二、vim选项设置

`:set 选项` ，选项前面加 no 表示关闭选项，如 `:set nonumber`

设置仅当前编辑窗口有效，退出后恢复默认值

有以下这些选项
```
all         列出所有选项设置情况
term        设置终端类型
ignorance   在搜索中忽略大小写
list        显示制表位(Ctrl+I)和行尾标志($)
number      显示行号
report      显示由面向行的命令修改过的数目
terse       显示简短的警告信息
warn        在转到别的文件时若没保存当前文件则显示NO write信息
nomagic     允许在搜索模式中，使用前面不带“\”的特殊字符
nowrapscan  禁止 vi 在搜索到达文件两端时，又从另一端开始
mesg        允许 vi 显示其他用户用 write 写到自己终端上的信息 
```
### 十三、Tips

`gg=G`： 代码格式化

### 十四、多窗口

https://github.com/ruanyf/articles/blob/master/dev/vim/operation.md#%E5%A4%9A%E7%AA%97%E5%8F%A3

# 文件I/O

`fcntl.h` : flag参数+open creat函数

`unistd.h` :  close lseek 函数

> int open(filename,flag,mode_t mode)

直接用八进制表示mode_t 0777 三位前面加个0 或者用 sys/types.h 中的类型表示

> int creat(filename,mode) 

函数只能以只写打开，所以现在一般被open新版本替代了 

`O_RDWR|O_CREAT|O_TRUNC`

> int close(int filedes)

现在一般利用进程终止会关闭文件的特点 而不显式关闭文件

> off_t lseek(filedes,off_t offset,int whence)


若filedes不能设置偏移量(fifo,socket,管道等filedes[文件描述符])
or 设置后的偏移量<0,返回-1；
否则 返回新的文件偏移量。

offset表示坐标处字节数，+为后，-为前

`whence`: `SEEK_SET: 文件开始处0  ; SEEK_CUR:当前值1 ; SEEK_END: 文件长度处2`
显式的为已打开文件设置偏移量

**注：**将当前偏移量记录在内核，用于下一次读or写操作

`e.q.: FILE_LEN=10; 此时设置lseek(filedes,20,0) 将返回20 `
对该文件下一次写将加长该文件，并在文件形成一个空洞；位于文件但未写过的字节都被读做0

关于空洞：后面会提到.

> ssize_t read(int filedes,void *buf,size_t nbytes)


> POSIX.1 read函数 int read(int filedes,char *buf,unsigned nbytes)


read success,return 读到的字节数。若到文件结尾，则返回0.


> int write(int filedes,char *buf,size_t nbytes) 返回值与nbytes一致，否则表示出错


## 文件共享

## ioctl

其他IO杂项的操作

## /dev/fd

`/dev/fd/0` 对应`dev/stdin` 1 2 对应stdout stderr

## fcntl(int fd,int cmd,...)

改变已打开文件的性质，具体看工具书




# 文件和目录

## 权限

对目录具有执行权限，指的是能进入该目录。

对目录具有读权限，指的是能用ls这样的命令去显示文件/目录列表

对目录具有写权限，指的是能在该目录下创建新文件/目录（创建目录还需要有执行权限）

在没有执行权限的情况下读目录
```
[gahing@gahing test]$ ll parent
ls: 无法访问parent/child: 权限不够
总用量 0
?????????? ? ? ? ?            ? child
```
其中目录结构为 test/parent/child

删除文件 需要对当前目录有写和执行权限。对该文件无需任何权限

权限是从 su -> 有效用户 -> 有效组用户 -> 其他用户 的顺序去判断的.

如果进程拥有此文件，则按用户访问权限去判断，不查看组访问权限（即使组可以 用户不行。

## 新文件/目录 的所有权

新文件的用户ID为当前进程的有效用户ID 组ID 可以是进程组ID or 所在目录的组ID


## 解压缩

tar

# 传输

> scp local_file remote_user@host:remote_folder

> rz  //选择本地文件传输

```sh
注意：单独用rz会有两个问题：上传中断、上传文件变化（md5不同），解决办法是上传是用rz -be，并且去掉弹出的对话框中“Upload files as ASCII”前的勾选。
-a, –ascii
-b, –binary 用binary的方式上传下载，不解释字符为ascii
-e, –escape 强制escape 所有控制字符，比如Ctrl+x，DEL等
rar,gif等文件文件采用 -b 用binary的方式上传。
```
一般小文件 `rz -b` 就可以了

文件比较大而上传出错的话，采用 `rz -be`

> 如果用不带参数的rz命令上传大文件时，常常上传一半就断掉了，很可能是rz以为上传的流中包含某些特殊控制字符，造成rz提前退出。

# 工具命令

```sh
## 查看端口使用情况
netstat -tunlp | grep 3306
## 查看端口被哪个进程占用
lsof -i:80
## 杀死指定进程名=shark
killall shark
## 杀死指定进程pid=666
kill -9 666
``` 

## 查看软件安装情况

1、rpm包安装的，可以用 rpm -qa 看到，如果要查找某软件包是否安装，用 rpm -qa | grep "软件或者包的名字"

2、以deb包安装的，可以用 dpkg -l 看到。如果是查找指定软件包，用 dpkg -l | grep "软件或者包的名字"

3、yum方法安装的，可以用 yum list installed 查找，如果是查找指定包，用 yum list installed | grep "软件名或者包名"

### 查看安装目录

```sh
whereis 软件名
```

## 查找文件 [find](https://www.runoob.com/linux/linux-comm-find.html)

```sh
find path -option [ -print ] [ -exec -ok command ] {} \;
```

`find . -name "*.c"` 查找当前目录及子孙目录中拓展名为 c 的文件

# 特殊

## 查看系统

`cat /etc/redhat-release` 例如显示：`CentOS release 6.8 (Final)`

## 设置环境变量

- 临时

```sh
export PATH=xxx

# 输出 xxx
echo $PATH 
```

- 永久

## 重启系统

# 用户和用户组

