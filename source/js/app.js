const Vue = require('vue');
const regexgen = require('regexgen');

new Vue({
    el: '#app',
    data: {
        input: '',
        strings: [],
        regex: '',
        alert: {
            displayed: false,
            message: '',
        }
    },
    watch: {
        strings(){
            if(!this.strings.length){
                this.regex = '';
                return;
            }

            this.regex = regexgen(this.strings).toString();
        }
    },
    methods: {
        reset(){
            var r = confirm('Are you sure to reset everything?');

            if(r){
                this.strings = [];
                this.regex = '';
            }
        },
        pushString(){
            if(this.input && this.checkDuplicate()){
                this.strings.push(this.input);
                this.input = '';
            }
        },
        checkDuplicate(){
            var duplicate = this.strings.includes(this.input);

            if(duplicate){
                return this.showAlert('String already in added string list');
            }

            return true;
        },
        removeString(index){
            this.strings.splice(index, 1);
        },
        showAlert(message){
            this.alert = {
                displayed: true,
                message: message,
            }

            setTimeout(() => {
                this.alert.displayed = false;
            }, 3000);
        }
    }
});