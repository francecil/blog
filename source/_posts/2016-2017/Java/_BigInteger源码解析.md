今天偶然看到BigInteger里面有一些有意思的函数。特意看了下源码


<!--more-->

当前大数后的第一个素数


    /**
        * 返回的这个数不是素数的可能性为2^-100.但不会跳过任何一个素数
        *
        * @return the first integer greater than this {@code BigInteger} that
        *         is probably prime.
        * @throws ArithmeticException {@code this < 0} or {@code this} is too large.
        * @since 1.5
        */
        public BigInteger nextProbablePrime() {
            if (this.signum < 0)
                throw new ArithmeticException("start < 0: " + this);
    
            // Handle trivial cases
            if ((this.signum == 0) || this.equals(ONE))
                return TWO;
    
            BigInteger result = this.add(ONE);
    
            // Fastpath for small numbers
            if (result.bitLength() < SMALL_PRIME_THRESHOLD) {
    
                // Ensure an odd number
                if (!result.testBit(0))
                    result = result.add(ONE);
    
                while (true) {
                    // Do cheap "pre-test" if applicable
                    if (result.bitLength() > 6) {
                        long r = result.remainder(SMALL_PRIME_PRODUCT).longValue();
                        if ((r%3==0)  || (r%5==0)  || (r%7==0)  || (r%11==0) ||
                            (r%13==0) || (r%17==0) || (r%19==0) || (r%23==0) ||
                            (r%29==0) || (r%31==0) || (r%37==0) || (r%41==0)) {
                            result = result.add(TWO);
                            continue; // Candidate is composite; try another
                        }
                    }
    
                    // All candidates of bitLength 2 and 3 are prime by this point
                    if (result.bitLength() < 4)
                        return result;
    
                    // The expensive test
                    if (result.primeToCertainty(DEFAULT_PRIME_CERTAINTY, null))
                        return result;
    
                    result = result.add(TWO);
                }
            }
    
            // Start at previous even number
            if (result.testBit(0))
                result = result.subtract(ONE);
    
            // Looking for the next large prime
            int searchLen = getPrimeSearchLen(result.bitLength());
    
            while (true) {
               BitSieve searchSieve = new BitSieve(result, searchLen);
               BigInteger candidate = searchSieve.retrieve(result,
                                                     DEFAULT_PRIME_CERTAINTY, null);
               if (candidate != null)
                   return candidate;
               result = result.add(BigInteger.valueOf(2 * searchLen));
            }
        }