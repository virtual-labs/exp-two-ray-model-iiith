To analyze the impact of mobility and multipath propagation on wireless communication by computing Doppler spread, coherence time, delay spread, and coherence bandwidth under different scenarios, please follow the following steps:

### Case 01
1) Input the Distance between transmitter and receiver (r), Velocity of receiver (v) (can be negative if moving away), and Carrier frequency (f).  
2) Observe the changes in doppler spread and coherence time with a change in the input parameters.  
   - <span style="color:blue">Increasing receiver velocity increases Doppler spread and reduces coherence time, indicating faster channel variation and the need for more frequent channel estimation.</span>  
   - <span style="color:blue">Higher carrier frequency also increases Doppler sensitivity, further reducing channel stability.</span>

### Case 02
1) Input the Distance between transmitter and receiver (r), Distance between transmitter and obstacle (d), and Carrier frequency (f).  
2) Observe the changes in delay spread and coherence bandwidth with a change in the input parameters.  
   - <span style="color:blue">Larger separation between direct and reflected paths increases delay spread, which reduces coherence bandwidth and introduces frequency-selective fading.</span>  
   - <span style="color:blue">Smaller delay spread leads to a wider coherence bandwidth, indicating a flatter channel that is easier to equalize.</span>

### Case 03
1) Repeat the above steps for a different set of inputs for both Doppler and delay spread.  
2) Compare and analyze the results by observing how mobility and multipath affect wireless performance.  
   - <span style="color:blue">High mobility primarily impacts **time variation** (Doppler and coherence time), while strong multipath primarily impacts **frequency selectivity** (delay spread and coherence bandwidth).</span>  
   - <span style="color:blue">Interpreting these trends helps relate simulation outcomes to practical system design choices such as pilot spacing, modulation scheme selection, and equalization requirements.</span>
