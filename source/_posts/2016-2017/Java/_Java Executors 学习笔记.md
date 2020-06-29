## 创建ThreadPoolExecutor

- `ThreadPoolExecutor executor=(ThreadPoolExecutor)Executors.newCachedThreadPool();`
    - 为每个接收到的任务创建一个线程（如果池中没有空闲的线程）
    - 提交大量的任务，并且它们有很长的（执行）时间，会使系统过载和引发应用程序性能不佳的问题
- `ThreadPoolExecutor executor=(ThreadPoolExecutor)Executors.newFixedThreadPool(5);`
    - 创建固定大小例如5的ThreadPoolExecutor
    - 提交超过最大线程数的任务，剩下的任务将会被阻塞，直到有空闲的线程来处理它们


<!--more-->


## 返回结果
- `executor.submit(Runnable())` 无返回结果
- `Future<?> result=executor.submit(Callable<?>)` 返回`Future`对象来管理任务
    - `result.isDone()`：所管理任务是否完成
    - `resultList.add(result)`,利用`while (executor.getCompletedTaskCount()<resultList.size());`让所有管理任务的Future执行完
    - `result.get()`获得任务结束返回的对象
## 运行多个任务并处理第一个结果
利用`ThreadPoolExecutor`类提供的`invokeAny(Collection tasks)`方法(接受的是**Callable任务**)，输入参数为一个任务队列,`ThreadPoolExecutor`c处理所有的任务，返回最早执行完任务的一个结果
## 运行多个任务并处理所有结果
上面利用`while (executor.getCompletedTaskCount()<resultList.size());`让管理任务的Future执行完，其实可以使用
`executor.invokeAll(Collection tasks)`去执行任务列表，并且返回`List<Future<Result>>  resultList`，此时主线程等待invokeAll执行完后(类似上面的**while**)进行下一步
## 延迟运行任务`ScheduledThreadPoolExecutor` 

    ScheduledThreadPoolExecutor executor=(ScheduledThreadPoolExecutor)Executors.newScheduledThreadPool(int corePoolSize);
    executor.schedule(Callable callable,Long delay(任务在执行前等待多长时间), TimeUnit 时间单位如TimeUnit.SECONDS);
    //使用executor的awaitTermination()方法，等待所有任务完成。
    //注：这里调用ScheduledThreadPoolExecutor的shutdown()方法，默认不会结束未执行的任务(等待delay执行的task)
    //可以通过ScheduledThreadPoolExecutor类的setExecuteExistingDelayedTasksAfterShutdownPolicy()方法来改变这种行为，
    //设为false就与其他Executor类一样了

## 执行周期性任务
之前创建的executor，任务在执行完就被executor删除了，需要重新执行时需要再向executor提交任务
可以通过：

    ScheduledExecutorService executor=Executors.newScheduledThreadPool(1);
    ScheduledFuture<?> result=executor.scheduleAtFixedRate(Runnable command,long initialDelay, long period, TimeUnit.SECONDS); 
     或者 executor.scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit)
    //注1：如果用的是scheduleAtFixedRate 周期运行，你有一个花5s执行的周期性任务，而period是3s，那么会在运行5s的任务后再运行5s周期任务，不会出现2个任务同时运行。而如果是scheduleWithFixedDelay 会运行完5s的任务后过3s再运行
    //result.getDelay(TimeUnit.MILLISECONDS));获取下次任务执行的剩余时间
    //注2：此executor.shutdown()方法默认的行为是，当你调用这个方法时，计划任务就结束。 你可以使用ScheduledThreadPoolExecutor类的 setContinueExistingPeriodicTasksAfterShutdownPolicy()方法设置true值改变这个行为。在调用 shutdown()方法时，周期性任务将不会结束。

## 取消任务

    Future<?> result=executor.submit(task);
    result.cancel(boolean mayInterruptIfRunning);
    System.out.printf("Main: Canceled: %s\n",result.isCanceled());
    //在cacle方法执行后,  isDone will always return true
    System.out.printf("Main: Done: %s\n",result.isDone()); 

cancel方法详解：

    if(该task已经完成||之前已被取消||由于其他原因不能取消)return false;
    else if(该task正在等待executor获取执行它的线程)then 那么task取消,return true;
    else if(这个任务已经正在运行){
        if(mayInterruptIfRunning){任务取消，return true;}
        else 任务不取消，return false;
    }

> 注：`Future.cancel()`方法，其实是`发送一个中断请求`，线程是否执行中断，**jvm需要得到检测中断的时间片(Thread.sleep)**
> 或 **Thread.interrupted()**的判断
> 见[http://ifeve.com/thread-executors-9/][1] 评论


  [1]: http://ifeve.com/thread-executors-9/