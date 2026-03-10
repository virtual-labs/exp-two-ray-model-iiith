To analyze the impact of mobility and multipath propagation on wireless communication by computing Doppler spread, coherence time, delay spread, and coherence bandwidth under different scenarios, please follow the following steps:

### Case 01
1) Input the distance between the transmitter and the receiver ($r$), velocity of the receiver ($v$) (can be negative if moving away), and the carrier frequency ($f_c$).  
2) Observe the changes in Doppler shift and coherence time with change in the input parameters.  
   - Increasing receiver velocity increases Doppler shift and reduces coherence time, indicating faster channel variation and the need for more frequent channel estimation.  
   - Higher carrier frequency also increases the Doppler shift, further reducing channel stability.

### Case 02
1) Input the Distance between transmitter and receiver ($r$), distance between the transmitter and the obstacle ($d$), and the carrier frequency ($f_c$).  
2) Observe the changes in delay spread and coherence bandwidth with a change in the input parameters.  
   - Larger separation between direct and reflected paths increases delay spread, reducing coherence bandwidth and introducing frequency-selective fading.  
   - Smaller delay spread leads to a wider coherence bandwidth, indicating a flatter channel that is easier to equalize.

### Case 03
1) Repeat the above steps for a different set of inputs for both Doppler shift and delay spread.  
2) Compare and analyze the results by observing how mobility and multipath affect wireless performance.  
   - High mobility primarily impacts **time variation** (Doppler shift and coherence time), while strong multipath primarily impacts **frequency selectivity** (delay spread and coherence bandwidth).  
   - Interpreting these trends helps relate simulation outcomes to practical system design choices such as pilot spacing, modulation scheme selection, and equalization requirements.
