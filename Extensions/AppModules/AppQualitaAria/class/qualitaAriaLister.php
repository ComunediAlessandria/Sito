<?php


api::inc( 'Template', 'Lister');

class qualitaAriaLister extends apiLister {

	const
		rpp = 20
	;


	protected function dAssets($n, $d)  {

		return array(

			pgAsset::js("
				$('.results').on('click','.btnDelRec', function(){
					
					var urldelete = $(this).data('urldelete');
					mostraModal(0, urldelete);
				});
				
				function mostraModal(id, urlDelete){
					apriModal(urlDelete);
					function  apriModal(urlDelete) {
						$('#deleteModal').modal('toggle');
						$('#containerDeleteModal').click(function(){
							location.href = urlDelete;
						});
					};
				}
			"),
		);
	}

	protected function modalHTML() {

		return "
			<!-- Modal per conferma cancellazione record -->
			<div class='modal fade' id='deleteModal' role='dialog'>
				<div class='modal-dialog'>
					<!-- Modal content-->
					<div class='modal-content'>
						<div class='modal-header'>
							<button class='close' data-dismiss='modal'>&times;</button>
							<h4 class='modal-title'>Cancellazione record</h4>
						</div>
						<div class='modal-body'>
							<h4>Vuoi davvero cancellare questo record dal database?</h4>
							<p><small>Questa operazione &egrave; irreversibile.</small></p>
						</div>
						<div class='modal-footer'>
							<button class='btn btn-default' data-dismiss='modal'>Annulla</button>
							<button id='containerDeleteModal' type='button' class='btn btn-danger' role='button'>Elimina</button>
						</div>
					</div>
				</div>
			</div>
		";
	}
}

