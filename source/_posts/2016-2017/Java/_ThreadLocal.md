>源码未看完，先占坑


每个Thread维护一个ThreadLocalMap
## 获取ThreadLocalMap

    /**
         * Get the map associated with a ThreadLocal. Overridden in
         * InheritableThreadLocal.
         *
         * @param  t the current thread
         * @return the map
         */    
    ThreadLocalMap getMap(Thread t) {
                return t.threadLocals;
            }


<!--more-->


## 获取ThreadLocal实例

    /**
         * Returns the value in the current thread's copy of this
         * thread-local variable.  If the variable has no value for the
         * current thread, it is first initialized to the value returned
         * by an invocation of the {@link #initialValue} method.
         *
         * @return the current thread's value of this thread-local
         */
        public T get() {
            Thread t = Thread.currentThread();
            ThreadLocalMap map = getMap(t);//先获取当前线程维护的ThreadLocalMap
            if (map != null) {
                //this:外部的ThreadLocal(如ThreadLocal<Session> stl;stl.get())那么该this就是该ThreadLocal对象stl;
                //Entry<key:this对象指向的ThreadLocal对象,value:我们所设置的对象，这里是Session>
                ThreadLocalMap.Entry e = map.getEntry(this);//得到该线程下map中的ThreadLocal对象stl
                if (e != null) {
                    @SuppressWarnings("unchecked")
                    T result = (T)e.value;
                    return result;
                }
            }
            return setInitialValue();
        }

## 设置ThreadLocal实例

    /**
         * Sets the current thread's copy of this thread-local variable
         * to the specified value.  Most subclasses will have no need to
         * override this method, relying solely on the {@link #initialValue}
         * method to set the values of thread-locals.
         *
         * @param value the value to be stored in the current thread's copy of
         *        this thread-local.
         */
        public void set(T value) {
            Thread t = Thread.currentThread();
            ThreadLocalMap map = getMap(t);
            if (map != null)
                map.set(this, value);
            else
                createMap(t, value);//不存在map,则创建该线程绑定的一个map
        }
## JDK1.4后用WeakReference的好处



不知道ThreadLocal干嘛用的，参考

    http://www.iteye.com/topic/103804
    [荐]http://qifuguang.me/2015/09/02/[Java%E5%B9%B6%E5%8F%91%E5%8C%85%E5%AD%A6%E4%B9%A0%E4%B8%83]%E8%A7%A3%E5%AF%86ThreadLocal/
