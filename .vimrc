set backupcopy=yes
let s:path = expand('<sfile>:p:h')
let g:syntastic_typescript_checkers = ['tslint']
let g:syntastic_javascript_checkers = ['eslint']

execute 'au BufWrite '.s:path.'/src/*.tsx :Autoformat'
execute 'au BufWrite '.s:path.'/src/*.ts :Autoformat'
execute 'au BufWrite '.s:path.'/*.json :Autoformat'
execute 'au BufWrite '.s:path.'/*.js :Autoformat'
