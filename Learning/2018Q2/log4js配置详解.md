Appender: 负责日志记录的方式：文件、控制台输出、网络发送、邮件发送

Category: 配置日志的类别，可以配置一个Appender数组，表示当前类别日志会通过其Appender数组的每种方式被记录，
可以配置一个level属性，表示传入的日志的level需要在其配置的level及之上才会被记录

`Category <--- 1：n ---> Appender`