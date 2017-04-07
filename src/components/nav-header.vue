<template>
<nav class="navbar navbar-toggleable-md navbar-light bg-faded" style='margin-bottom:10px;'>
	<button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>

	<router-link class="navbar-brand" to='/'>Comprende!</router-link>


	<div class="collapse navbar-collapse" id="navbarSupportedContent">
		<ul class="navbar-nav mr-auto">
			<li class="nav-item dropdown">
				<span v-if='user.isLoggedIn()' style='cursor:pointer;' class="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{user.getUserName()}}</span>
				<span v-else class="nav-item"><a target='_blank' href='./index.php?title=Special:Login'>Log in</a></span>
				<div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
					<a v-if='user.isLoggedIn()' class="dropdown-item" href='#' @click.prevent='user.userSettingsDialog'><i18n k='user settings'/></a>
					<a v-if='user.isLoggedIn()' class="dropdown-item" :href="user.getUserPageURL()"><i18n k='user page'/></a>
					<a href='https://github.com/magnusmanske/comprende' target='_blank' class='dropdown-item external'><i18n k='git'/></a>
				</div>
			</li>
		</ul>
	</div>
	<div class="collapse navbar-collapse" id="navbarSupportedContent"></div>

<div id='user_settings_dialog' style='display:none' class='modal fade'>
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"><i18n k='user settings'/></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group row">
          <label for="example-text-input" class="col-4 col-form-label"><i18n k='main language'/></label>
          <div class="col-8"><input class="form-control" type="text" v-model='user.settings.language'></div>
        </div>
        <div class="form-group row">
          <label for="example-text-input" class="col-4 col-form-label"><i18n k='fallback languages'/></label>
          <div class="col-8"><input class="form-control" type="text" value='' id='user_fallback_languages'></div>
        </div>
        <div class="form-group row">
        	<div class="col-12"><label><input type='checkbox' v-model='user.settings.edit_interface_translations' /> <i18n k='edit_interface_translations'/></label></div>
        	<div class="col-12"><label><input type='checkbox' v-model='user.settings.show_wikidata_links' /> <i18n k='show wikidata links in answers'/></label></div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click='user.userSettingsSave'>Save changes</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal" @click='user.userSettingsCancel'>Close</button>
      </div>
    </div>
  </div>
</div>

</nav>
</template>

<script>
import i18n from './i18n.vue'
import { user } from '../config.js'

export default {
	data : function () { return { user } } ,
	components : { i18n } ,
}
</script>

<style>
</style>