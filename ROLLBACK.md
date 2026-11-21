# Rollback — V2 experimental

`admin-v2.html` e `sala-v2.html` são arquivos novos. Os originais `admin.html`, `sala.html`, `auditoria.html`, `server.js` e `package.json` não foram modificados. A implementação está isolada na branch `feature/webrtc-indexeddb`, criada a partir de `main` no commit `4d085bce4530c1197c9c56929de6336c5dbff167`.

## Reverter sem tocar nos originais

- Não faça merge da branch e volte para `main`; ou
- Para remover somente os arquivos V2 depois de integrá-los, apague `admin-v2.html`, `sala-v2.html` e `ROLLBACK.md` em um commit de reversão.
- Se a branch já tiver sido integrada por um commit único, use `git revert <SHA_DO_COMMIT>` (reversível e preferível a reescrever histórico).

Os dados salvos pelos testes usam chaves `gpx_db_admin`/`salas_locais_admin` no adaptador V2 e `gpx_db_sala_v2` para a cópia do cliente. Excluir os arquivos V2 não apaga essas chaves locais; limpe-as manualmente nas ferramentas do navegador se quiser remover os dados de teste.

## Limitações de teste

WebRTC manual requer que oferta e resposta sejam copiadas entre as duas páginas. Sem STUN ativado, espera-se funcionamento somente em redes onde candidatos host conseguem se comunicar; STUN ajuda em alguns cenários, mas não garante atravessar NAT/firewall. O fallback PeerJS exige PeerServer compatível e configurado por quem opera o admin. Tor não é garantido: navegadores podem bloquear WebRTC ou conexões diretas podem não funcionar através da rede Tor. Nenhuma conformidade legal é certificada por este código.
