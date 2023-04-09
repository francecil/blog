# 1.synchronized 基础

## 1.1[synchronized 实例方法与静态方法的区别][1]

## 1.2重入不死锁

```java
    public class Base {
    	public  synchronized void say (){
    		System.out.println("Base");
    	}
    
    }
>
    public class Child extends Base{
    
    	@Override
    	public synchronized void say() {
    		// TODO Auto-generated method stub
    		System.out.println("Child");
    		super.say();//正常super.say方法获取不到对象锁(重入)，不过由于处于同一个锁，系统解决该问题了。
    	}
    }

>

    	public static void main(String[] args) {
    		// TODO Auto-generated method stub
    //		testClassAndObject();
    		Child c=new Child();
    		c.say();
    	}
```

<!--more-->


# 2.volatile

> 访问变量不需要加锁才能用volatile

## 2.1重排序问题

设置 volatile 标识的系统不会进行重排序

用于解决如下问题：
```java
    boolean changed=false;
    int num;
    Runnable a{
        run(){
            while(!changed){
                print(num);    
            }
        }
    }
    main(){
        1: num=10;
        2: changed=true;
        3: new Thread(a).start();
    }
```

**未给changed，num设置volatile的话 语句1 2 3不一定会串行，系统会进行重排序，导致出现意想不到的结果。。**
当然这个问题除了给变量加volatile外还可以给每条语句加锁

## 2.2 jvm指定-server while操作编译器做了什么优化？
### 背景
***参考：http://blog.csdn.net/jinwufeiyang/article/details/51546054***
JVM发现某个代码块运行特别频繁，认定为“热点代码”编译为本地代码，进行如下优化
指定`-client` compiler获取更高的编译速度，`-server` compiler来获取更好的编译质量
> 对Client Compiler而言，是一个简单快速的三段式编译器，主要关注点在于局部性的优化，放弃了许多耗时较长的全局优化手段

>对Server Compiler则是专门面向服务端的典型应用并为服务端的性能配置特别调整过的编译器。它会执行所有的经典的优化动作，如：`无用代码消除，循环展开，循环表达式外提，公共子表达式消除，常量传播，基本块重排序`等，还会实施一些与Java语言特性密切相关的优化技术，如范围检查消除，空值检查消除。

这里我们讨论循环展开，其他的参考书籍《深入理解Java虚拟机：JVM高级特性与最佳实践》

```java
    boolean asleep=false;
    while(!asleep){
        ...
    }
    new Thread(new Runnable(){
        run(){asleep=true;}
    }).start();

JVM 会将

    while(!asleep){
            ...
        }

编译优化为

    if(!asleep){
        while(true){
            ...//死循环
        }
    }
```
因为编译器认为本线程内该变量不可变
如果是指定clientcompile的话就不会做这样的优化

**当然如何选择server的话，记得把asleep设为volatile,这样所有线程对asleep都是可见的，非单线程使用，编译器不会做上面那样的优化**

#　~~ 3.线程发布 ~~ 

##　本章后面发现无论是哪种方法 都无法避免this引用被其他类保存，或者是我不懂线程发布的含义
## 不过还是学习了反射怎么获取内部匿名类的this引用

~~ 如果this引用在构造中逸出，这样的构造是不安全构造 ~~
下面举一个例子：在构造过程中，携带this引用的内部匿名类传递给其他线程并被修改
这里需要了解下背景
### 内部匿名类发布，其他类可以获取内部匿名类的外部类引用使得外部类数据被修改。请问其他类怎么通过内部匿名类怎么获取其外部引用？
**`这里需要了解反射`**

```java
    package com.france;
    
    public class ThisEscape {
    	public ThisEscape(EventSource source){
    		a=2;
    		source.registerListener(new EventListener(){
    			public void onEvent(String s){
    				System.out.println(s+a);
    			}
    		});
    	}
    	public int a=1;
    }

>

    package com.france;
    
    public class EventListener {
    	public void onEvent(String s){
    		System.out.println("what?");
    	}
    }
>

    package com.france;
    
    import java.lang.reflect.Field;
    
    public class EventSource {
    	public void registerListener(EventListener el) {
    
    		System.out.println(el);
    		
    		try {
    			ThisEscape es=(ThisEscape) getOuterObject(el);
    			es.a=4;
    		} catch (IllegalAccessException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    		}
    		
    		el.onEvent("sd");
    	}
        //获取一个内部匿名类的最外部类引用实例
    	private Object getOuterObject(Object object) throws IllegalAccessException {
                //得到此class对象所表示的类或接口所声明的所有字段
    		Field[] fields = object.getClass().getDeclaredFields();
    		for (Field field : fields) {
    			if (field.getName().contains("this$")) {
                                //无论私有还是公有，先设置为可修改
    				field.setAccessible(true);
    				Object result = field.get(object);
    				if (field.getName().equals("this$0")) {
    					return result;
    				} else {
    					return getOuterObject(result);
    				}
    			}
    		}
    		return null;
    	}
    }
```
>运行结果:
```
    com.france.ThisEscape$1@2a139a55
    sd4
```
> 说明外部引用是被获取到的。
注：**`this$0就是内部类所自动保留的一个指向所在外部类的引用`**
类似的this$1 $2...如下
```java
    //Outer.java 
    public class Outer {//this$0 
    public class FirstInner {//this$1 
      public class SecondInner {//this$2 
       public class ThirdInner { 
       } 
      } 
    } 
```

### ~~  那么我们要怎么防止这种情况呢？不要在构造过程中使this逸出 ~~
只有当构造函数返回时，才应该让this溢出
解决方法：私有构造函数和工厂方法

```java
    package safepublish;
    
    
    public class NoEscape {
    	private final EventListener el;
    	private NoEscape() {
    		el=new EventListener(){
    			public void onEvent(String s){
    				System.out.println(s+a);
    			}
    		};
    	}
    	public int a=1;
    	public static NoEscape newInstance(EventSource source){
    		NoEscape noEscape=new NoEscape();
    		source.registerListener(noEscape.el);
    		return noEscape;
    	}
    }
>


    public static void main(String[] args) {
    		NoEscape.newInstance(new EventSource());
    	}
```




# 4.线程封闭
## 4.1[ThreadLocal][2]
## 4.2swing开发就是采用线程封闭，不共享数据以防止数据不一致，其swing对象非线程安全，所以除事件线程外其他线程对这些对象操作都会导致并发错误
## 4.3JDBC 连接池如何获取连接？
书本原话：

    JDBC规范并不要求Connection对象必须是线程安全的。在典型的服务器应用程序中，线程从连接池中获得一个Connection对象，并且用该对象来处理请求，使用完后再将对象返还给连接池。由于大多数请求（例如Servlet请求或EJB调用等）都是由单个线程采用同步的方式来处理，并且在Connection对象返回之前，连接池不会再将它分配给其他线程，因此，这种连接管理模式在处理请求时隐含地将Connection对象封闭在线程中。

# 5.不可变-final 解析
基本类型的话值不能再修改，引用类型(如数组）的话不能修改其(内存)引用，但是能改变引用类型的值(如修改数组某位的值)
有时也用该方法+volatile来防止数据不同步

# 6.结构化学习
## 6.1Timer相比任务线程池Executors有什么缺陷？
Timer执行所有TimeTask只有一个线程，所以多个Task的时候不能让每个Task按各自的“周期”操作(单线程的原因)
## 6.2 [Executors使用][3]
## 6.3 [动手写一个并发缓存框架-Future的使用][4]

# 7.任务取消与关闭
最简单的是用`volatile boolean caccelled,while(!cancelled){}`去不断检查
但这种做法不能适合所有情况。如

    BlockingQueue queue=new BlockingQueue(5);

生产者线程：

    Producer：while(!cancelled)queue.put(p=nextProbablePrime); //不断去获取素数放到阻塞队列

消费者线程：

    Producer.start();
    try{
        while(needMorePrimes())consume(queue.take())
    }finally{
        Producer.cancel();//设置Producer：cancelled=true;
    }

如果生产者线程速度比消费者快，则`BlockingQueue`始终处于堵塞状态
而此时消费者线程设置生产者线程cancelled=true，此时`消费者不再消费queue`,**生产者queue却处于堵塞状态 不会执行while判断**;

此时应该采用interrupt的方式，具体含义用法请百度
这里给出一个结论：**`interrupt是实现取消的最合理方式`**
上述问题只要改生产者的方法：

    while(!cancelled) 

    --> 

    try{
        while(!Thread.currentThread().isInterrupted()){queue.put(p=nextProbablePrime);}
    }catch(InterruptedException e){
        //线程退出后的处理
    }

    void cancel(){cancelled=true;} 
    
    --> 

    void cancel(){ interrupt();}//触发线程中断 这边需要有可以响应中断的函数 queue.put就是一种 具体见下下节


### 中断策略
当前线程检查到中断请求时，`catch InterruptedException`中处理：任务可以推迟处理中断 并在完成任务后`throw InterruptedException`或者`表示收到中断请求`

**大多数库函数都只是抛出InterruptedException作为中断请求**

### 响应中断
**收到中断请求线程不是马上停止。**要想使当前线程响应中断，那么当前线程必须要有个能响应中断的方法获得时间片，常见的有`Thread.sleep`或`BlockingQueue.put`
【*Java没有提供抢占式中断机制*】
正如上节所说，出现InterruptedException后我们可以`传递异常` 或者`恢复中断状态`

将InterruptedException传递给调用者:`不catch`而是在方法上加`throws InterruptedException`


    public Task getNextTask(BlockingQueue<Task> queue) throws InterruptedException{
        return queue.take();
    }

如果无法传递，如Runnable定义任务**Task**不会返回异常`（只能catch到不能throws传递）`，那么可以再次调用interrupt来恢复中断状态
    

    public Task getNextTask(BlockingQueue<Task> queue){
        boolean interrupted = false;//本地保存中断状态
        try{
            while(true){
                try{
                    return queue.take();
                }catch(InterruptedException e){
                    interrupted=true;
                    //重新尝试
                    //有个问题 不能throw InterruptedException 吗？肯定是的，该异常只能调用中断时产生 所以需要本地保存中断状态
                }
            }
        }finally{
            if(interrupted)Thread.currentThread().interrupt();//返回时恢复中断 
        }
    }

### 通过Future实现任务取消

`Future.cancel`方法：

    if(该task已经完成||之前已被取消||由于其他原因不能取消)return false;
    else if(该task正在等待executor获取执行它的线程)then 那么task取消,return true;
    else if(这个任务已经正在运行){
        if(mayInterruptIfRunning){任务取消，return true;}
        else 任务不取消，return false;
    }

  [1]: http://hongweipeng.com/index.php/archives/860/#menu_index_4
  [2]: http://hongweipeng.com/index.php/archives/656/
  [3]: http://hongweipeng.com/index.php/archives/682/
  [4]: http://hongweipeng.com/index.php/archives/707/

