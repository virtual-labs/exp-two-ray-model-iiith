# THEORY

### Wireless channels operate through electromagnetic radiation from the transmitter to the receiver.
![Basic](https://github.com/Manasa090/exp-two-ray-model-based-wireless-channels-iiith/blob/main/Exp3.png)
### In response to the transmission of sinusoid  $\cos(2\pi ft)$, the received signal in free space with fixed antenna (i.e. Scenario 1) can be expressed as
```math
    E(f,t,(r,\theta,\psi)) = \frac{\alpha\left(\theta,\psi,f\right)\cos{2\pi f(t-\frac{r}{c})}}{r},
```
### where $c$ is the speed of light, and $\alpha$ is the radiation pattern of the transmitting antenna at frequency $f$ in the direction $(\theta,\psi)$ as shown in the figure. It can be observed that as the distance increases, the electric field decreases resulting in the decline of received power with the increase in the distance between transmitting and receiving antennas.
### However, it is not practical to consider that the receiver is always in a fixed position. Thus, let us consider that the receiver is moving away from transmitter with a velocity $v$. As the receiver moves away, the distance between the subsequent wavefronts of the transmitted EM signal observed by receiving antennas  increases. This can be inferred as a decrease in the frequency as shown below.
![movement](https://github.com/Manasa090/exp-two-ray-model-based-wireless-channels-iiith/blob/main/exp3_1.png)
### Hence, the frequency of the received signal appears to be different from the frequency of transmitted signal. This frequency shift is proportional to the relative velocity between the transmitter and receiver and is referred to as the {\em Doppler spread}. The signal received  by the moving antenna in free space (i.e. Scenario 2) at time $t$ can be expressed as
```math
     E(f,t,(r,\theta,\psi)) = \frac{\alpha\left(\theta,\psi,f\right)\cos{2\pi f(t-\frac{r+vt}{c})}}{r+vt}= \frac{\alpha\left(\theta,\psi,f\right)\cos{2\pi f((1-\frac{v}{c})t-\frac{r}{c})}}{r+vt} \nonumber
```
### where $r$ is the initial distance.
### From above expression, the shift in received frequency, i.e. Doppler shift, can be observed to be $-\frac{fv}{c}=\frac{v}{\lambda}$. The $-ve$ sign signifies the drop in frequency as the receiver is moving away from the source. Similar results can be observed when the receiver is moving towards the source, however, the doppler shift would be $+ve$.
### Another closely related concept to understand from Doppler shift is the {\em coherence time} which is the time duration over which the channel impulse response, or frequency response, remains strongly correlated or predictable. In practical terms, it represents the time scale over which the wireless channel can be considered approximately constant. The coherence time of the channel and the Doppler shift are inversely related. This is because the coherence time dictates how long the channel remains approximately constant, while the Doppler shift affects how rapidly the channel conditions change due to motion. Systems with shorter coherence times require more frequent channel estimation and adaptation to track the rapidly changing channel conditions caused by motion. Conversely, systems with longer coherence times can maintain relatively stable channel estimates for longer duration, requiring less frequent channel estimation and adaption of transmission signal. 
### All the above understanding is still not close to reality as we have not considered any obstacles. Let us now try to understand the effect of obstacles by considering a reflecting wall  as shown below.
![obstacle](https://github.com/Manasa090/exp-two-ray-model-based-wireless-channels-iiith/blob/main/exp3_2.png)
### As we can see, this set-up (i.e. Scenario 3) involves the superposition of two signals at the receiving antenna, one received directly from the transmitting antenna and the other one is the reflected back from the obstacle. This gives rise to the concept of {\em delay spread} which is the time difference between the arrival of the first and last significant paths of the transmitted signal at the receiver. It is important to understand that this superposition can result in constructive or destructive interference. The received signal in such scenario can  be expressed as
```math
    E(f,t,(r,\theta,\psi)) = \frac{\alpha\left(\theta,\psi,f\right)\cos{2\pi f(t-\frac{r}{c})}}{r} - \frac{\alpha\left(\theta,\psi,f\right)\cos{2\pi f(t-\frac{2d-r}{c})}}{2d-r},
```
### and the delay spread can be quantified as $\frac{2d-r}{c}-\frac{r}{c}$. This is closely toied to the concept of {\em coherence bandwidth} which refers to the range of frequencies over which the wireless channel response remains correlated or predictable. In practice, a larger delay spread implies a shorter coherence bandwidth and vice versa. Systems with higher delay spread may require more sophisticated equalization techniques to mitigate the effects of interference caused by the spread of signal arrival times.
