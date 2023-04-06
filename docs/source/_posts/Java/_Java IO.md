# Java IO
## `java.io.File`类用于表示文件（目录）
File类只用于表示文件（目录）的信息（名称、大小等），不能用于文件内容的访问


    File file = new File("F:\\临时文档\\958032738");//填入相对或绝对地址
    //判断文件(夹)是否存在
    if(!file.exists())
    	file.mkdir(); //创建文件夹
    else
    	file.delete();//删除文件夹
    //是否是一个目录  如果是目录返回true,如果不是目录or目录不存在返回的是false
    System.out.println(file.isDirectory());
    //是否是一个文件 如果是文件返回true,如果不是文件or文件不存在返回的是false
    System.out.println(file.isFile());
    //new file 的构造方式
    File file2 = new File("e:\\javaio\\日记1.txt");
    File file3 = new File("e:\\javaio","日记1.txt");
    if(!file2.exists())
    	try {
    		file2.createNewFile();//创建文件
    	} catch (IOException e) {
    		// TODO Auto-generated catch block
    		e.printStackTrace();
    	}
    else 
    	file2.delete();//删除文件
             //常用的File对象的API
    System.out.println(file);//file.toString()的内容 F:\临时文档\958032738
    System.out.println(file.getAbsolutePath());//绝对地址 F:\临时文档\958032738
    System.out.println(file.getName());//文件（夹）名   958032738
    System.out.println(file.getParent());//父文件夹 toString F:\临时文档
    System.out.println(file.getParentFile().getAbsolutePath());//F:\临时文档
    //列出该目录下的所有文件(夹) 返回的是文件(夹)的名字数组(非路径)
    String filenames[] = file.list();
    for(String filename:filenames)
	    System.out.println(filename);

> 目录文件遍历


<!--more-->


    void listDirectory(File dir) throws IOException {
		// 如果要遍历子目录下的内容，可以判断是否是子目录再递归，File提供了直接返回file对象的api
		File[] files = dir.listFiles();
		if (files != null && files.length > 0) {
			for (File mFile : files) {
				if (mFile.isDirectory()) {
					listDirectory(mFile);
				} else {
					System.out.println(mFile);
				}
			}
		}
	}

>   使用文件(夹)名过滤器`FilenameFilter` 去除db结尾的文件

		File[] files2 = file.listFiles(new FilenameFilter() {
			
			public boolean accept(File dir, String name) {
				// TODO Auto-generated method stub
				if(name.length()>0&&name.endsWith("db"))
					return false;
				return true;
			}
		});
		for (File mFile : files2) {
			System.out.println(mFile);
		}

    

> 文件过滤器`FileFilter`，pathname是file对象，可以直接处理

		File[] files = file.listFiles(new FileFilter() {

			public boolean accept(File pathname) {
				// TODO Auto-generated method stub
				if (pathname.isDirectory())
					return false;
				return true;
			}
		});
		for (File mFile : files) {
			System.out.println(mFile);
		}

## `RandomAccessFile` 
java提供的对文件内容的访问，既可以读文件，也可以写文件。
`RandomAccessFile`支持随机访问文件，可以访问文件的任意位置

**(1)java文件模型**
  在硬盘上的文件是byte byte byte存储的,是数据的集合
**(2)打开文件**
  有两种模式"rw"(读写)  "r"（只读)
  

    RandomAccessFile raf = new RandomeAccessFile(file,"rw")

  文件指针，打开文件时指针在开头 `raf.getFilePointer() = 0;`
  
**(3) 写方法**
    `raf.write(int)`--->只写一个字节（后8位),同时指针指向下一个位置，准备再次写入
   
            int i = 0x7fffffff;
            //用write方法每次只能写一个字节，如果要把i写进去就得写4次
    		raf.write(i >>> 24);//高8位
    		raf.write(i >>> 16);
    		raf.write(i >>> 8);
    		raf.write(i);
            //或者用封装好的，源码其实也是上面的实现
            //可以直接写一个int
            raf.writeInt(i);
            //写入带编码的字符串
            String s="中";
            byte utf[]=s.getBytes("UTF-8");
            raf.write(utf);

**(4)读方法**
   `int b = raf.read()`--->读一个字节
   > 注：要读出与写入一样的数据和类型，怎么写入的就怎么读,参考`(6)`

**(5)文件读写完成以后一定要关闭`raf.close()`**


**(6)`序列化与基本类型序列化`**
1）将**类型int** 转换成`4byte`或将**其他数据类型**转换成`byte`的过程叫**`序列化`**


    数据---->n byte

2)**`反序列化`**
    将`n个byte` 转换成一个**数据**的过程

    nbyte ---> 数据

3)`RandomAccessFile`提供基本类型的读写方法，可以将`基本类型数据序列化到文件`或者将`文件内容反序列化为数据`


    public class RafSeriaTest {
    
    	/**
    	 * @param args
    	 * @throws IOException 
    	 */
    	public static void main(String[] args) throws IOException {
    		// TODO Auto-generated method stub
    		File demo = new File("demo1");
    		if(!demo.exists())demo.mkdir();
    		File file = new File(demo,"raf.dat");
    		if(file.exists())
    			file.delete();
    		if(!file.exists())
    			file.createNewFile();
    		//打开文件，进行随机读写
    		RandomAccessFile raf = new RandomAccessFile(file, "rw");
    		/*序列化*/
    		String s="helloworld";
    		byte buf[]=s.getBytes("UTF-8");
    		raf.write(buf);
    		System.out.println(raf.getFilePointer());
    		int i=454651234;
    		raf.writeInt(i);
    		System.out.println(raf.getFilePointer());
    		
    		
    		/*反序列化*/
    		raf.seek(0);
    		byte buf2[]=new byte[10];
    		raf.read(buf2);
    		System.out.println(new String(buf2));
    		int b=raf.readInt();
    		System.out.println(b);
    		raf.close();
    	}
    
    }
    /*
    output:
    10
    14
    helloworld
    1679497581
    */

遇到skipBytes函数，看下源码

    /**
         * Attempts to skip over {@code n} bytes of input discarding the
         * skipped bytes.
         * 尝试跳过n个字节，然后通过seek去修改当前文件指针位置
         *
         * This method may skip over some smaller number of bytes, possibly zero.
         * This may result from any of a number of conditions; reaching end of
         * file before {@code n} bytes have been skipped is only one
         * possibility. This method never throws an {@code EOFException}.
         * The actual number of bytes skipped is returned.  If {@code n}
         * is negative, no bytes are skipped.
         *
         * @param      n   the number of bytes to be skipped.
         * @return     the actual number of bytes skipped.
         * @exception  IOException  if an I/O error occurs.
         */
        public int skipBytes(int n) throws IOException {
            long pos;
            long len;
            long newpos;
            //负数或0则不跳
            if (n <= 0) {
                return 0;
            }
            pos = getFilePointer();//当前文件指针位置
            len = length();//naive方法，返回当前文件长度
            newpos = pos + n;//新位置
            //ex:pos=3,len=10,n=4 ->newpos=7 seek(7) return 4
            //如果相加>len :pos=3,len=10,n=9 ->newpos=10 seek(10) return 7 no 9
            if (newpos > len) {
                newpos = len;
            }
            seek(newpos);
    
            /* 返回实际跳过的字节数 */
            return (int) (newpos - pos);
        }

##  **`字节流`**

 1) **InputStream、OutputStream**
    InputStream抽象了应用程序读取数据的方式
    OutputStream抽象了应用程序写出数据的方式 
 2) EOF = End   读到-1就读到结尾
 3) **输入流基本方法(读)**


       int  b = in.read();读取一个字节无符号填充到int低八位.-1是 EOF
       in.read(byte[] buf) 将读入数据填充到buf字节数组
       in.read(byte[] buf,int start,int size)

4) **输出流基本方法(写)**


      out.write(int b)  写出一个byte到流，b的低8位
      out.write(byte[] buf)将buf字节数组都写入到流
      out.write(byte[] buf,int start,int size)

  
 5) `FileInputStream`--->具体实现了在文件上读取数据


        /*
    	 * 读取指定文件内容以16进制输出，每20byte换行
    	 * 注：单字节不适合读取大文件数据
    	 * */
    	public static void printHex(String fileName)throws IOException{
    		FileInputStream in=new FileInputStream(fileName);
    		int b;
    		int index=1;
    		while((b=in.read())!=-1){
    			if(b<=0xf){
    				//只有低4位，前补0
    				System.out.print(0);
    			}
    			System.out.print(Integer.toHexString(b)+" ");
    			if(index++%20==0)System.out.println();
    		}
            in.close();
    	}

    /**
    	 * 批量读取，对大文件而言效率高，也是我们最常用的读文件的方式
    	 * @param fileName
    	 * @throws IOException
    	 */
    	public static void printHexByByteArray(String fileName)throws IOException{
    		FileInputStream in=new FileInputStream(fileName);
    		byte buf[]=new byte[8*1024];//8kbytes的buf
    		int index=1;
    		/*从in中批量读取字节，放入到buf这个字节数组中，每个字节只存放低8位
    		 * 从第0个位置开始放，最多放buf.length个 
    		 * 返回的是读到的字节的个数,or -1 如果没有更多的数据可以读取因为已经搜索到文件末尾(剩余数据大小<=buf.length)
    		 */
    		int bytes=0;//读取的字节个数
    		while((bytes=in.read(buf,0,buf.length))!=-1){
    			for(int i=0;i<bytes;i++){
    				//(buf[i]<=0xf&&buf[i]>=0x0)将0x0 ->0xf前补0 0xa0<0
    				//或者用buf[i] & 0xff 判断
    //				System.out.print(((buf[i]<=0xf&&buf[i]>=0x0)?"0"+Integer.toHexString(buf[i]):Integer.toHexString(buf[i] & 0xff) )+" ");//高位清0 避免错误
    				System.out.print((((buf[i] & 0xff)<=0xf)?"0"+Integer.toHexString(buf[i]):Integer.toHexString(buf[i] & 0xff) )+" ");//高位清0 避免错误
    				if(index++%20==0)System.out.println();
    			}
    		}
    		in.close();
    	}

 6) `FileOutputStream` 实现了向文件中写入byte数据的方法


    public class FileOutputStreamTest {
    	public static void main(String[] args) throws IOException {
    		//如果该文件不存在，则直接创建，如果存在，append为true则追加，false则删除后创建 (不指定 append 默认false删除后创建 )
    		//FileOutputStream(String name, boolean append)
    		FileOutputStream fos=new FileOutputStream("demo/out.dat");
    		fos.write('A');//只有write方法，只写低八位
    		//写int同样需要写4次
    		int a = 10;//write只能写八位,那么写一个int需要些4次每次8位
    		fos.write(a >>> 24);
    		fos.write(a >>> 16);
    		fos.write(a >>> 8);
    		fos.write(a);
    		byte[] gbk = "中国".getBytes("gbk");
    		fos.write(gbk);
    		fos.close();
    		IOUtil.printHex("demo/out.dat");
    	}
    }

>综合上诉两个demo 做一个复制文件的demo

    /**
    	 * 文件拷贝，字节批量读取
    	 * @param srcFile
    	 * @param destFile
    	 * @throws IOException
    	 */
    	public static void copyFile(File srcFile,File destFile)throws IOException{
    		if(!srcFile.exists()){
    			throw new IllegalArgumentException("文件:"+srcFile+"不存在");
    		}
    		if(!srcFile.isFile()){
    			throw new IllegalArgumentException(srcFile+"不是文件");
    		}
    		FileInputStream in = new FileInputStream(srcFile);
    		FileOutputStream out = new FileOutputStream(destFile);
    		byte[] buf = new byte[8*1024];
    		int b ;
    	    while((b = in.read(buf,0,buf.length))!=-1){
    	    	out.write(buf,0,b);
    	    	out.flush();
    	    }
    	    in.close();
    	    out.close();
    		
    	}

 7) DataOutputStream/DataInputStream
    **对"流"功能的扩展，可以更加方面的读取int,long，字符等类型数据**
 
 > DataOutputStream

      DataOutputStream dos = new DataOutputStream(new FileOutputStream(file));
        		dos.writeInt(10);
        		dos.writeInt(-10);
        		dos.writeLong(10l);
        		dos.writeDouble(10.5);
        		//采用utf-8编码写出
        		dos.writeUTF("中国");
        		//采用utf-16be编码写出
        		dos.writeChars("中国");
        		dos.close();
> DataInputStream

    DataInputStream dis = new DataInputStream(
    			   new FileInputStream(file));
    	   int i = dis.readInt();
    	   System.out.println(i);
    	   i = dis.readInt();
    	   System.out.println(i);
    	   long l = dis.readLong();
    	   System.out.println(l);
    	   double d = dis.readDouble();
    	   System.out.println(d);
    	   String s = dis.readUTF();
    	   System.out.println(s);
    	   
           dis.close();

 8) **`BufferedInputStream / BufferedOutputStream`**
 这两个流类位IO提供了带缓冲区的操作，一般打开文件进行写入
 或读取操作时，都会加上缓冲，**这种流模式提高了IO的性能**
 从应用程序中把输入放入文件，相当于将一缸水倒入到另一个缸中:
 **FileOutputStream--->write()**方法相当于一滴一滴地把水“转移”过去
 **DataOutputStream-->writeXxx()**方法会方便一些，相当于一瓢一瓢把水“转移”过去
 **BufferedOutputStream--->write**方法更方便，相当于一飘一瓢先放入桶中，再从桶中倒入到另一个缸中，性能提高了

几个复制文件的demo

    /**
    	 * 进行文件的拷贝，利用带缓冲的字节流
    	 * @param srcFile
    	 * @param destFile
    	 * @throws IOException
    	 */
    	public static void copyFileByBuffer(File srcFile,File destFile)throws IOException{
    		if(!srcFile.exists()){
    			throw new IllegalArgumentException("文件:"+srcFile+"不存在");
    		}
    		if(!srcFile.isFile()){
    			throw new IllegalArgumentException(srcFile+"不是文件");
    		}
    		BufferedInputStream bis = new BufferedInputStream(new FileInputStream(srcFile));
    		BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(destFile));
    		int a;
    		while((a=bis.read())!=-1){
    			bos.write(a);
    			bos.flush();//刷新缓冲区，否则写入不到文件
    		}
    		bis.close();
    		bos.close();
    	}
    	/**
    	 * 进行文件的拷贝，利用带缓冲的字节流,以一定机制去刷新,而不是每次都去刷新
    	 * @param srcFile
    	 * @param destFile
    	 * @throws IOException
    	 */
    	public static void copyFileByBuffer2(File srcFile,File destFile)throws IOException{
    		if(!srcFile.exists()){
    			throw new IllegalArgumentException("文件:"+srcFile+"不存在");
    		}
    		if(!srcFile.isFile()){
    			throw new IllegalArgumentException(srcFile+"不是文件");
    		}
    		BufferedInputStream bis = new BufferedInputStream(new FileInputStream(srcFile));
    		BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(destFile));
    		int a;
    		int index=0;
    		while((a=bis.read())!=-1){
    			
    			bos.write(a);
    			if(index++%10==0)
    			bos.flush();//刷新缓冲区，否则写入不到文件
    		}
    		bos.flush();
    		bis.close();
    		bos.close();
    	}

**`复制文件总结`**  
1. 带buffer比不带buffer更快，每次都flush的话只快2-3倍左右
2.  带buffer，一定次数再flush比每次都flush快的多，测试：10次再flush比每次flush快10倍左右
3. 批量读取比单字节读取快的多，测试：buf[8*1024]比单字节快几千倍
可以说最快的就是批量读取+一定次数再flush
不过 对于大文件操作，直接利用加大批量读取即可，一定次数再flush可以说是多此一举了对于内存利用来说。



   
## **`字符流`**
 1) 编码问题
 2) 认识文本和文本文件
 java的**文本**(char)是16位无符号整数，unicode编码（双字节编码)
 **文件**是byte byte byte ...的数据序列
 **文本文件**是文本(char)序列按照某种编码方案(utf-8,utf-16be,gbk)序列化为byte的存储结果
3) **字符流(Reader Writer)**---->操作的是文本文件
字符的处理，一次处理一个字符
字符的底层仍然是基本的字节序列
字符流的基本实现
>   InputStreamReader   完成byte流解析为char流,按照编码解析
>   OutputStreamWriter  提供char流到byte流，按照编码处理  

       public class IsrAndOswDemo {
    	public static void main(String[] args)throws IOException {
    		FileInputStream in = new FileInputStream("e:\\javaio\\a.txt");
    		InputStreamReader isr = new InputStreamReader(in,"utf-8");//默认是项目的编码,操作的时候，要写文件本身的编码格式
    	
    		FileOutputStream out = new FileOutputStream("e:\\javaio\\b.txt");
    		OutputStreamWriter osw = new OutputStreamWriter(out,"utf-8");
    		/*int c ;
    		while((c = isr.read())!=-1){
    			System.out.print((char)c);
    		}*/
    		char[] buffer = new char[8*1024];
    		int c;
    		/*批量读取，放入buffer这个字符数组，从第0个位置开始放置，最多放buffer.length个
    		  返回的是读到的字符的个数
    		*/
    		while(( c = isr.read(buffer,0,buffer.length))!=-1){
    			String s = new String(buffer,0,c);
    			System.out.print(s);
    			osw.write(buffer,0,c);
    			osw.flush();
    		}
    		isr.close();
    		osw.close();
    		
    	}
    
    }

   4. **FileReader/FileWriter**

    public class FrAndFwDemo {
    	public static void main(String[] args) throws IOException {
    		//不存在则创建，存在非追加则删除重建
    		FileReader fr = new FileReader("demo\\file.txt");
    		FileWriter fw = new FileWriter("demo\\file2.txt");
    		char[] buf=new char[1024];
    		int c;
    		while((c=fr.read(buf,0,buf.length))!=-1){
    			fw.write(buf,0,c);
    			fw.flush();
    		}
    		fr.close();
    		fw.close();
    	}
    }

**`存在的问题`：**FileReader/FileWriter 构造函数没有指定编码格式。
如项目编码是UTF-8,file.txt是gbk,则file2.txt编码与项目编码一致，故会产生乱码。
**解决方法：**用InputStreamReader / OutputStreamReader     或者 操作文件编码与项目编码一致

 5. **字符流的过滤器**
   BufferedReader   ---->readLine 一次读一行
   BufferedWriter/PrintWriter   ---->写一行    


    public class BrAndBwOrPwDemo {
    	public static void main(String[] args) throws IOException {
    		//对文件进行读写操作
    		BufferedReader br=new BufferedReader(
    				new InputStreamReader(
    						new FileInputStream("demo\\file.txt")));
    		BufferedWriter bw=new BufferedWriter(
    				new OutputStreamWriter(
    						new FileOutputStream("demo\\file3.txt")));
    		String line="";
    		while((line=br.readLine())!=null){
    			System.out.println(line);//一次读一行，不带换行，手动加上
    			bw.write(line);
    			bw.newLine();//写入一个'\n'
    			bw.flush();
    		}
    		br.close();
    		bw.close();
    	}
    }	  

 若改使用PrintWriter会更方便

    public void usePrint() throws IOException {
    		// 对文件进行读写操作
    		BufferedReader br = new BufferedReader(new InputStreamReader(
    				new FileInputStream("demo\\file.txt")));
    		PrintWriter pw=new PrintWriter("demo\\file4.txt");
    		String line = "";
    		while ((line = br.readLine()) != null) {
    			System.out.println(line);// 一次读一行，不带换行，手动加上
    			//pw还有append,format,write,print等函数
    			pw.println(line);
    			pw.flush();
    		}
    		br.close();
    		pw.close();
    	}

   
## **`对象的序列化，反序列化`**
1) **对象序列化，就是将Object转换成byte序列，反之叫对象的反序列化** 
2) `序列化流(ObjectOutputStream)`,是过滤流----writeObject
   `反序列化流(ObjectInputStream)`---readObject
>主要是读写对象，当然extends OutputStream所以OutputStream的基本方法也可以使用

>Student.class

    public class Student implements Serializable{
    	private String stuno;
    	private String stuname;
    	private int stuage;  
    public Student(String stuno, String stuname, int stuage) {
    		super();
    		this.stuno = stuno;
    		this.stuname = stuname;
    		this.stuage = stuage;
    	}
    @Override
	public String toString() {
		return "Student [stuno=" + stuno + ", stuname=" + stuname + ", stuage="
				+ stuage + "]";
	}
    }


> 序列化和反序列化

    public class ObjectSeriaDemo1 {
    	public static void main(String[] args) throws FileNotFoundException, IOException, ClassNotFoundException {
    		String file="demo/obj.dat";
    		//序列化
    		ObjectOutputStream oos=new ObjectOutputStream(new FileOutputStream(file));
    		Student stu=new Student("1", "gahingZ", 21);
    		oos.writeObject(stu);
    		oos.flush();
    		oos.close();
    		//反序列化
    		ObjectInputStream ois=new ObjectInputStream(new FileInputStream(file));
    		Student mStu=(Student) ois.readObject();
    		System.out.println(mStu.toString());
    	}
    }
    output:
    Student [stuno=1, stuname=gahingZ, stuage=21]


3) **序列化接口(Serializable)**
   对象必须实现序列化接口 ，才能进行序列化，否则将出现异常
   这个接口，没有任何方法，只是一个标准
 
4) **transient关键字**


    //该元素不会进行jvm默认的序列化
    //Student类不想让stuage序列化
    private transient int stuage; 

>再次运行ObjectSeriaDemo1
 

       output:
        Student [stuno=1, stuname=gahingZ, stuage=0]
> 0是int的默认值，用这种方式就可以简单的让某些元素不被序列化

   ***分析ArrayList源码中序列化和反序列化的问题***

    transient Object[] elementData; // non-private to simplify nested class access
    //该元素是已开辟的数组，存入的数据长度一般是不满的，so不需要进行序列化 用transient 修饰,否则整个都序列化性能太差，eq:开辟了10000的数组 却只存了1个元素

    如果要手动序列化，则Studnt类加入以下方法

     private void writeObject(java.io.ObjectOutputStream s)
    		        throws java.io.IOException{
    		 s.defaultWriteObject();//把jvm能默认序列化的元素进行序列化操作
    		 s.writeInt(stuage);//自己完成stuage的序列化
    	 }
    	 private void readObject(java.io.ObjectInputStream s)
    		        throws java.io.IOException, ClassNotFoundException{
    		  s.defaultReadObject();//把jvm能默认反序列化的元素进行反序列化操作
    		  this.stuage = s.readInt();//自己完成stuage的反序列化操作
    	}
		        
>再次运行ObjectSeriaDemo1

       output:
        Student [stuno=1, stuname=gahingZ, stuage=21]

当然上面这样写没有什么意义(要序列化呢还是不序列化呢)，
所以一般要写writeObject方法的都是数组元素非整个序列化，序列化的个数是动态的。
那么，让我们分析ArrayList中的写法

    private void writeObject(java.io.ObjectOutputStream s)
            throws java.io.IOException{
            // Write out element count, and any hidden stuff
            int expectedModCount = modCount;
            s.defaultWriteObject();//默认的都序列化了
    
            // Write out size as capacity for behavioural compatibility with clone()
            s.writeInt(size);
    
            // elementData只放了size个 所以就只序列化size个 而不是elementData.length
            for (int i=0; i<size; i++) {
                s.writeObject(elementData[i]);
            }
            //并发操作异常
            if (modCount != expectedModCount) {
                throw new ConcurrentModificationException();
            }
        }

 
5) 序列化中 **子类和父类构造函数的调用问题**
> **一个类实现了序列化接口，其子类都可以序列化**
> **子类在反序列化时，从最顶级父类开始往下找(递归)，若父类实现了序列化接口，则不会递归调用其构造函数，否则其父类的构造函数会被调用**



    package com.france;
    
    import java.io.FileInputStream;
    import java.io.FileNotFoundException;
    import java.io.FileOutputStream;
    import java.io.IOException;
    import java.io.ObjectInputStream;
    import java.io.ObjectOutputStream;
    import java.io.Serializable;
    
    class Bar{
    	Bar(){
    		System.out.println("Bar..");
    	}
    }
    class Bar1 extends Bar{
    	Bar1(){
    		System.out.println("Bar1..");
    	}
    }
    class Bar2 extends Bar1 implements Serializable{
    	public Bar2(){
    		System.out.println("Bar2..");
    	}
    }
    class Bar3 extends Bar2{
    	public Bar3(){
    		System.out.println("Bar3..");
    	}
    }
    class Bar4 extends Bar3{
    	public Bar4(){
    		System.out.println("Bar4..");
    	}
    }
    public class ObjectSeriaDemo2 {
    	
    	public static void main(String[] args) throws FileNotFoundException, ClassNotFoundException, IOException {
    		test1();
    		test2();
    	}
    	static void test1()throws FileNotFoundException, IOException, ClassNotFoundException {
    		ObjectOutputStream oos = new ObjectOutputStream(
    				new FileOutputStream("demo/obj1.dat"));
    		Bar2 bar2=new Bar2();
    		oos.writeObject(bar2);
    		System.out.println("---------");
    		oos.flush();
    		oos.close();
    		
    		ObjectInputStream ois = new ObjectInputStream(
    				new FileInputStream("demo/obj1.dat"));
    		Bar2 mBar2=(Bar2) ois.readObject();
    		System.out.println(mBar2);
    		ois.close();
    		System.out.println("---------");
    	}
    	static void test2()throws FileNotFoundException, IOException, ClassNotFoundException {
    		ObjectOutputStream oos = new ObjectOutputStream(
    				new FileOutputStream("demo/obj2.dat"));
    		Bar4 bar4=new Bar4();
    		oos.writeObject(bar4);
    		System.out.println("---------");
    		oos.flush();
    		oos.close();
    		
    		ObjectInputStream ois = new ObjectInputStream(
    				new FileInputStream("demo/obj2.dat"));
    		Bar4 mBar4=(Bar4) ois.readObject();
    		System.out.println(mBar4);
    		ois.close();
    		System.out.println("---------");
    	}
    }
    

>

    output:
    Bar..
    Bar1..
    Bar2..
    ---------
    Bar..
    Bar1..
    com.france.Bar2@3d4eac69
    ---------
    Bar..
    Bar1..
    Bar2..
    Bar3..
    Bar4..
    ---------
    Bar..
    Bar1..
    com.france.Bar4@1b6d3586
    ---------

 
 即[Bar、Bar1不可序列化] Bar2实现序列化接口 并且 Bar3/Bar4都可序列化

可序列化的子类 2-4 在`进行反序列化时，会递归调用 不可序列化父类的构造函数`
 
 
 
 
   
   
   
   
   
   
   
