<template id='edit-question-template'>
<div>
<div class="card card-stack">

<edit-question-multiple-choice v-if='question.type==wdid.q_multiple_choice_question' :question='question'>
<ul :class='getClass' slot='warnings'>
<li v-if='problems.label_description_collision'>
	<div><i18n k='A question with this exact label and description in this language already exists as'></i18n> <router-link :to='"/question/"+ld_double' target='_blank'>{{ld_double}}</router-link>.</div>
	<div><i18n k='You need to change the label or the description, otherwise the question can not be imported'/></div>
</li>
<li v-if='problems.empty_label_description'><i18n k='both a label and a text are required'/></li>
<li v-if='problems.minimum_answers'><i18n k='A minimum of two answers is required'/></li>
<li v-if='problems.fractions_100'><i18n k='The fractions of the answers need to sum up to 100'/></li>
<li v-if='problems.blank_answers'><i18n k='Answer texts must not be empty'/></li>
<li v-if='problems.image_required'><i18n k='An image must be selected'/></li>
</ul>
</edit-question-multiple-choice>

<edit-question-label-image v-else-if='question.type==wdid.q_label_item_question' :question='question'>
<ul :class='getClass' slot='warnings'>
<li v-if='problems.label_description_collision'>
	<div><i18n k='A question with this exact label and description in this language already exists as'></i18n> <router-link :to='"/question/"+ld_double' target='_blank'>{{ld_double}}</router-link>.</div>
	<div><i18n k='You need to change the label or the description, otherwise the question can not be imported'/></div>
</li>
<li v-if='problems.empty_label_description'><i18n k='both a label and a text are required'/></li>
<li v-if='problems.minimum_answers'><i18n k='A minimum of two answers is required'/></li>
<li v-if='problems.fractions_100'><i18n k='The fractions of the answers need to sum up to 100'/></li>
<li v-if='problems.blank_answers'><i18n k='Answer texts must not be empty'/></li>
<li v-if='problems.image_required'><i18n k='An image must be selected'/></li>
</ul>
</edit-question-label-image>
<div v-else>Unknown question type "{{question.type}}"</div>

<div class="card-block">
<label><input type='checkbox' v-model='question.import2wb' /> Import question to Comprende!</label>
<label><input type='checkbox' v-model='question.add2quiz' /> Add question to quiz</label>
<button class='btn btn-sm btn-outline-danger' @click.prevent='deleteQuestion'>Delete this question</button>
</div>

</div>
</div>
</template>

<script>
import i18n from '../i18n.vue'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'
import { wdid } from '../../config.js'
import EditQuestionMultipleChoice from './edit-question-multiple-choice.vue'
import EditQuestionLabelImage from './edit-question-label-image.vue'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'question' ] ,
	data : function () { return { problems:{label_description_collision:false,empty_label_description:false,minimum_answers:false,fractions_100:false,blank_answers:false,image_required:false} , ld_double:'' , wdid } } ,
	components : {
		'edit-question-multiple-choice':EditQuestionMultipleChoice ,
		'edit-question-label-image':EditQuestionLabelImage ,
		i18n
	} ,
	created : function () {
		this.checkLabelDescription()
	} ,
	computed : {
		getClass : function () {
			var has_problem = false ;
			$.each ( this.problems , function ( k , v ) { if ( v ) has_problem = true } ) ;
			this.question.can_be_imported = !has_problem ;
			return { alert:has_problem , 'alert-danger':has_problem , dontshow:!has_problem } ;
		}
	} ,
	methods : {
		deleteQuestion : function () {
			this.$emit ( 'delete_question' , this.question.id ) ;
		} ,
		checkLabelDescription : function () {
			var me = this ;
			var label = $.trim ( me.question.label.text ) ;
			var text = $.trim ( me.question.text.text ) ;
			var lang = me.question.label.language ;
			var sum = 0 ;
			$.each ( me.problems , function ( k , v ) { me.problems[k] = false } ) ; // Reset
			$.each ( me.question.answers , function ( k , v ) {
				sum += parseInt ( v.fraction.text ) ;
				if ( $.trim(v.text.text) == '' ) me.problems.blank_answers = true ;
			} ) ;
			if ( me.question.type == wdid.q_multiple_choice_question ) me.problems.fractions_100 = sum != 100 ;
			me.problems.minimum_answers = me.question.answers.length < 2 ;
			if ( me.question.type == wdid.q_multiple_choice_question ) me.problems.empty_label_description = (label=='' || text=='') ;
			if ( me.question.type == wdid.q_label_item_question ) me.image_required = (me.question.image!='') ;
			me.searchEntity ( label , 'item' , function ( d ) {
				me.problems.label_description_collision = false ;
				$.each ( d.search , function ( k , v ) {
					if ( v.label != label || v.description != text ) return ;
					me.problems.label_description_collision = true ;
					me.ld_double = v.id ;
					return false ;
				} ) ;
			} ) ;
		}
	} ,
	watch : {
		'question.label.text' : function () { this.checkLabelDescription() } ,
		'question.text.text' : function () { this.checkLabelDescription() } ,
		'question.answers' : { handler : function () { this.checkLabelDescription() } , deep : true }
	}
}
</script>

<style>
</style>
