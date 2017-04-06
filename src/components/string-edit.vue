<template>
<div class="form-group row"  :class='getClasses'>
<label class="col-2 col-form-label"><i18n :k='i18n_key'/></label>
<div v-if='typeof type=="undefined"' class="col-10"><input class="form-control" type="text" v-model='value.text' :placeholder='the_placeholder' @keyup.enter='$emit("enter")' /></div>
<!--<div v-if='type=="fraction"' class="col-10" :class='getClasses'><input class="form-control" type="number" min="0" max="100" v-model='value' /></div>-->
<!--<div>{{type}}</div>-->
</div>
</template>

<script>
import i18n from './i18n.vue'

export default {
	props : [ 'label' , 'value' , 'type' , 'noempty' , 'placeholder' ] ,
	components : { i18n } ,
	data : function () { return { the_placeholder:'' , i18n_key:'' } } ,
	created : function () {
		this.i18n_key = this.label ;
	} ,
	mounted : function () {
		this.i18n_key = this.label ;
		if ( typeof this.placeholder == 'undefined' ) this.the_placeholder = '' ;
		else this.the_placeholder = this.placeholder ;
		if ( this.noempty ) this.the_placeholder = this.the_placeholder + (this.the_placeholder==''?'M':'; m') + 'ust not be empty' ;
	} ,
	computed : {
		getClasses : function () {
			var me = this ;
			var ret = {} ;
			if ( me.noempty && me.value.text.length == 0 ) ret['has-danger'] = true ;
			return ret ;
		}
	} ,
}
</script>

<style>
</style>
