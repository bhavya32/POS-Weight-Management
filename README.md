# POS-Weight-Management
 Smart weighing system for small businesses. 

## Communication standard (Arduino)

```w:000.00;cf:00000;dt:1000```

w is the Weight,  cf is the calibration factor and dt is the delay in sampling(in ms). This line is send by arduino every cycle, through serial at baud rate of 9600.

Following functions are used to control parameters in arduino -

### Change calibration factor
```cf:00000```

### Change sampling frequency
```dt:0000```

### Set Zero
```zero```
