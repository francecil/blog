# 日志采集
> translate ：根据hash值替换，可指定文件https://www.elastic.co/guide/en/logstash/current/plugins-filters-translate.html

> mutate ：数据转换https://www.elastic.co/guide/en/logstash/current/plugins-filters-mutate.html

> grok建立多副本，用于后面过滤器并发修改时数据不一致

>性能调优：https://www.elastic.co/guide/en/logstash/current/tuning-logstash.html

>filter插件：https://www.elastic.co/guide/en/logstash/current/filter-plugins.html

>filter共有方法：添加移除字段等

> 数据恢复：数据异常or程序异常退出  https://www.elastic.co/guide/en/logstash/current/resiliency.html
>>		数据异常：目前还不知道什么情况下会发生。。dead letter queue没有数据
>>		程序退出 ： queue.checkpoint.writes: 1  每1次写入队列就会标记，故会记录到采集的点