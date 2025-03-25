

import {interval, subscription}  from rxjs;

@Component({
    selector: 'timer',
    template: '<div class ="clock">
    {{hour}}: {{min}}: {{seconds}}
    </div>',
})

class Timer() implement ngOnit{
    let date = new Date();


    let hour ;
    let min ;
    let sec ;

    ngOnit(){
        this.subscription = interval(1000).subscription(
            this.updateTime()
        )
    }
    

    getUpdateTime(){
      date = new Date();
      this.hour = date.getDate;
      this.min = date.getMinutes;
      this.sec = date.getSeconds;
    }



}