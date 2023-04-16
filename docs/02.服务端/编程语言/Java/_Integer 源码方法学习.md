---
title: Integer 源码方法学习
date: 2020-06-29 22:18:37
permalink: /pages/f661cb/
categories: 
  - 服务端
  - 编程语言
  - Java
tags: 
  - 
titleTag: 草稿
---
## 求 32位无符号整数 前导0个数
#### 注意使用场景，一般会用该方法的前导0个数不会少
#### 汇编中逻辑右移可直接用指令 `SHR reg/men ,n` 即物理上 a>>2 比 (a>>1)>>1 快
首先想到的肯定是循环遍历

    public static int numberOfLeadingZerosByLoop(int i){
    		if(i==0)return 32;
    		int n=0;
    		while(i>>31==0){
    			n++;
    			i<<=1;
    		}
    		return n;
    	}

> 实现简单，但平均时间略高


<!--more-->


源码实现

    public static int numberOfLeadingZeros(int i) {
            // HD, Figure 5-6
            if (i == 0)
                return 32;
            int n = 1;
            if (i >>> 16 == 0) { n += 16; i <<= 16; }
            if (i >>> 24 == 0) { n +=  8; i <<=  8; }
            if (i >>> 28 == 0) { n +=  4; i <<=  4; }
            if (i >>> 30 == 0) { n +=  2; i <<=  2; }
            n -= i >>> 31;
            return n;
        }

> 二分判断，快速，且每次操作把两种情况合成一种

## 求后缀0个数
同理，

      public static int numberOfTrailingZeros(int i) {
            // HD, Figure 5-14
            int y;
            if (i == 0) return 32;
            int n = 31;
            y = i <<16; if (y != 0) { n = n -16; i = y; }
            y = i << 8; if (y != 0) { n = n - 8; i = y; }
            y = i << 4; if (y != 0) { n = n - 4; i = y; }
            y = i << 2; if (y != 0) { n = n - 2; i = y; }
            return n - ((i << 1) >>> 31);
        }


## 求二进制数中1的个数
常规做法，循环按位与1

    public static int bitCountByLoop(int i) {
    		int n=0;
    		while(i!=0){
    //			等效于 if((i&1)==1)n++;
    			n+=i&1;
    			i>>=1;
    		}
    		return n;
        }


复杂度与下面这种一致
利用符号位是否>=0 判断1的个数

    public static int bitCountByZF(int i) {
    		int n=0;
    		while(i!=0){
    			if(i<0)n++;
    			i<<=1;
    		}
    		return n;
        }

> 复杂度扔为O(log2n)

若让算法的运算次数只与“ 1 ”的个数有关,复杂度可降低
**利用 `x&x-1` 会消去最末位1的思路**

    public static int bitCountByAWY(int i) {
    		int n=0;
    		while(i!=0){
    			i&=i-1;
    			n++;
    		}
    		return n;
        }

> 上面 这种方法效率已经很高了，只与1的个数有关
那JDK源码实现呢？看懂和写出代码果然是两种不一样的境界。。。


        // 二分法 求32位整数中1的个数
    	public static int bitCount(int i) {
    		// 2位为一组，例 i=11100001 i>>>1 =01110000
    		// 01110000 & 0101 0101 = 01010000
    		//i=11100001 - 01010000= 10010001
    		//11100001 每2位一组1的个数为 2 1 0 1 即10010001
            i = i - ((i >>> 1) & 0x55555555);
            //计算每4位一组1的个数
            //i&0x33333333 -> 10010001 & 00110011 =0001 0001
            //(10010001 >>> 2) & 0x33333333 ->01001000 & 00110011=0001 0000
            //i=0001 0001 + 0001 0000 =0010 0001    2 1
            i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
            //计算每8位一组1的个数
            i = (i + (i >>> 4)) & 0x0f0f0f0f;
            //计算每16位一组1的个数
            i = i + (i >>> 8);
            //计算每32位一组1的个数
            i = i + (i >>> 16);
            return i & 0x3f;
        }

另外还有一种叫 HAKMEM 算法的，没研究

    private int HAKMEM (int x) {  
           int n;     
           n = (x >> 1) & 033333333333;     
           x = x - n;    
           n = (n >> 1) & 033333333333;     
           x = x - n;     
           x = (x + (x >> 3)) & 030707070707;    
           x = x%63;   
           return x;    
         }  

ref:[http://15838341661-139-com.iteye.com/blog/1642525][1]


## 保留最高位1，其余全部置0
还是2分的思路，源码


    public static int highestOneBit(int i) {
        // HD, Figure 3-1
        i |= (i >>  1);
        i |= (i >>  2);
        i |= (i >>  4);
        i |= (i >>  8);
        i |= (i >> 16);
        return i - (i >>> 1);
    }

## 未完待续
  [1]: http://15838341661-139-com.iteye.com/blog/1642525