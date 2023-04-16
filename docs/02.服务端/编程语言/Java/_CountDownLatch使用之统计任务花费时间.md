---
title: CountDownLatch使用之统计任务花费时间
date: 2020-06-29 22:18:37
permalink: /pages/e928eb/
categories: 
  - 服务端
  - 编程语言
  - Java
tags: 
  - 
titleTag: 草稿
---
CountDownLatch是一种闭锁，延迟线程的进度直到终止状态
包括一个计数器，初始化一个正数，表示需要等待的事件数量。

> **countDown**:递减计数器 
> **await**:等待计数器直到0


<!--more-->


    
    import java.util.concurrent.CountDownLatch;
    
    public class TestCountDownLatch {
    	public static long timeTasks(int nThreads,final Runnable task) throws InterruptedException{
    		final CountDownLatch startLatch=new CountDownLatch(1);
    		final CountDownLatch endLatch = new CountDownLatch(nThreads);
    		final StringBuffer stringBuffer=new StringBuffer();
    		for(int i=0;i<nThreads;i++){
    			 Thread t=new Thread(){
    				public void run(){
    					System.out.println("初始化线程资源");
    					try{
    						startLatch.await();
    						try{
    							//do something
    							task.run();
    						}finally{
    							endLatch.countDown();
    						}
    						
    					}catch(InterruptedException ignored){}
    				}	
    			};
    			t.start();
    		}
    		long start = System.nanoTime();
    		stringBuffer.append("startLatch await pre end\n");
    		//初始化线程资源:如创建线程等，这些时间花费是不要算入任务时间的
    		//调用countDown用 所有线程开始进行run方法
    		startLatch.countDown();
    		//等待所有线程结束
    		endLatch.await();
    		long end=System.nanoTime();
    		System.out.println(stringBuffer.toString());
    		return end-start;
    	}
    	/**
    	 * @param args
    	 */
    	public static void main(String[] args) {
    		// TODO Auto-generated method stub
    		Runnable runnable=new Runnable() {
    			@Override
    			public void run() {
    				// TODO Auto-generated method stub
    				try {
    					Thread.sleep(3000);
    				} catch (InterruptedException e) {
    					// TODO Auto-generated catch block
    					e.printStackTrace();
    				}
    			}
    		};
    		try {
    			System.out.println("使用时间："+timeTasks(5,runnable));
    		} catch (InterruptedException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    		}
    	}
    
    }

