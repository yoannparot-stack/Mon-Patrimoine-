# Connecteur de test : offre gratuite à quota partagé

**Décision du 1er novembre 2026 : cette architecture à clé API commune est écartée pour la production.** Ses 50 annonces sur 30 jours appartiennent au compte fournisseur entier et non à chaque client ImmOptima. Ne pas demander de créer une clé commune pour résoudre l’accès de tous les clients. Le connecteur et les commandes ci-dessous restent des outils de test, désactivés par défaut. Une connexion individuelle distincte est étudiée dans [PER_CLIENT_ACCESS.md](PER_CLIENT_ACCESS.md), sans être encore validée de bout en bout.

## Offre identifiée le 1er novembre 2026

[ChercherTrouver](https://cherchertrouver.immo/api) annonce une offre Découverte sans carte bancaire : 50 annonces distinctes sur 30 jours glissants. L’offre revient chaque période, contrairement à un simple essai de quelques jours. Ce quota appartient au compte : il n’est pas multiplié par le nombre de clients d’ImmOptima. Il permet un petit pilote, pas un service illimité à grande échelle. Les limites restent celles du fournisseur et peuvent évoluer.

Ses [CGV](https://cherchertrouver.immo/cgv) distinguent le compte consommateur et l’usage professionnel. Pour ImmOptima, vérifier et choisir l’usage professionnel : elles permettent l’exploitation dans les propres produits/services, avec attribution et lien direct d’origine. Elles ne transfèrent pas les droits des tiers sur les textes et images. L’adaptateur ne restitue donc que les caractéristiques chiffrées nécessaires, les dates, la source et le lien ; aucun descriptif publicitaire, contact ni photo.

La [documentation API](https://cherchertrouver.immo/api/docs) et son [OpenAPI](https://cherchertrouver.immo/openapi.json) ont été examinés. L’API exige une clé et impose son utilisation côté serveur. Le simple accès au site public n’active pas l’API.

## Ce qui est déjà développé

- Adaptateur `cherchertrouver.cjs`, indépendant de Yanport et de Firebase Functions.
- Vérification `/ping`, annoncée sans consommation d’annonce, avant la recherche. Seul le palier `free` avec quota cohérent est accepté ; une clé de palier payant est refusée par ce connecteur de pilote.
- Une seule petite page par demande, au plus 8 annonces pour analyser Nu et Meublé ensemble ; pas de pagination ni de nouvelle tentative automatique. Deux annonces de marge sont conservées sur le quota, car le fournisseur ferme aussi la relecture des annonces connues lorsqu’il est épuisé.
- Recherche par commune/code postal, type, surface et pièces ; filtrage de fraîcheur explicite. La date à laquelle le fournisseur a revu chaque annonce est conservée séparément de celle de notre requête. La disponibilité réelle d’un logement ne peut pas être garantie par la présence d’une annonce.
- Le schéma publié ne donne pas de champs structurés garantis pour les loyers HC, les charges et le mobilier : lecture conservatrice des mentions explicites. Une cuisine équipée n’implique pas un logement meublé. Un prix sans indication de charges n’est jamais assimilé au HC.
- Rejet des descriptions tronquées, cas ambigus, saisonnier, colocation, mobilité et annonces signalées comme douteuses. Au moins trois comparables retenus pour une cible. Une réponse de recherche dégradée ou un quota atteint ne devient pas un faux « aucun bien disponible ».
- Tests automatisés sur réponses fictives conformes aux champs documentés : 16 groupes au total avec le moteur public. **Aucune annonce authentifiée réelle n’a encore été testée** : compte et clé ne sont pas disponibles dans cet environnement.

L’adaptateur n’est pas encore connecté au bouton de la V19. Le passage à l’application cliente dépend d’abord du test réel de couverture et des champs HC/Meublé ; une promesse marketing du fournisseur ne suffit pas à valider ce point.

## Étape utilisateur nécessaire

1. Ouvrir [la page API](https://cherchertrouver.immo/api), créer un compte gratuit pour l’usage professionnel prévu et sélectionner Découverte. Ne souscrire aucune offre payante.
2. Dans le compte, rubrique API, créer/récupérer une clé. Ne pas la publier dans un message, un fichier du dépôt ni dans l’APK.
3. L’enregistrer dans le dépôt GitHub, Settings → Secrets and variables → Actions → New repository secret, sous le nom `IMMOPTIMA_CT_API_KEY`.
4. Dans Actions, lancer **Check free rental API access**, sur `feature/immoptima-step3-brand-ux`, avec les deux cases décochées. Cela appelle seulement `/ping` et affiche le palier et les compteurs, sans clé ni annonce.
5. Après réussite et vérification des conditions professionnelles, lancer une seconde fois avec les cases `collect_sample` et `professional_use_confirmed` cochées. Les valeurs Tours / 37000 / 37261 / 30 m² / 1 pièce sont un point de départ technique : elles doivent correspondre au logement réellement utilisé pour le test.

Le workflow n’est jamais lancé automatiquement et aucun compte fournisseur n’a été créé à la place de l’utilisateur. Les journaux publics ne contiennent que les compteurs, les indicateurs calculés et les motifs de rejet. Ils ne contiennent ni annonces individuelles, ni clé, ni coordonnées.

Alternative locale dans un terminal privé : définir `IMMOPTIMA_CT_API_KEY` comme variable d’environnement, puis lancer `node ct-probe.cjs` pour le contrôle sans annonce. `--collect` exige aussi `IMMOPTIMA_CT_PROFESSIONAL_USE=confirmed` et une requête JSON sur l’entrée standard. Ne jamais afficher les variables d’environnement dans les journaux.

## Hébergement et suite Android

Firebase peut rester sur Spark. Un relais peut être adapté à un hébergement gratuit, par exemple [Cloudflare Workers Free](https://developers.cloudflare.com/workers/platform/pricing/), dans ses limites. La clé restera dans les secrets du relais, et les clients utiliseront leur connexion ImmOptima. Un compte d’hébergement et son déploiement seront nécessaires ; aucun relais Cloudflare n’est encore créé ni déployé.

Avant l’ouverture aux clients : valider des annonces réelles Nu et Meublé, les champs absents, les quotas, les dates et les liens ; déployer le relais avec authentification et limites par client ; raccorder le transport Android à son URL et vérifier l’APK installé. Le quota gratuit doit rester explicite. À son épuisement, la collecte s’arrête et les autres fonctions continuent : aucun passage payant automatique n’est programmé.
