	$(document).ready(function() {

		loginStatus();

		$('#logout-btn').on('click',function(){
			var contractTermId = globalInfo("contract_term_id");
			removeGlobalInfo('jwt_' + contractTermId);
			removeGlobalInfo('returnUrl', {path: '/'});
			location.reload();
		});

	});
