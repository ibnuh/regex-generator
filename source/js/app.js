const Vue = require('vue');
const regexgen = require('regexgen');

new Vue({
    el: '#app',
    data: {
        input: '',
        strings: [],
        regex: '/none/'
    },
    watch: {
        strings(){
            this.regex = regexgen(this.strings).toString();
        }
    },
    methods: {
        pushString(){
            this.strings.push(this.input);
            this.input = '';
        },
        removeString(index){
            this.strings.splice(index, 1);
        }
    }
});