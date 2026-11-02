# Comparatif locatif gratuit — vérification du 2 novembre 2026

## Conclusion et état de l’application

**Aucune source complète, gratuite et exploitable automatiquement n’a été validée pour fournir partout en France trois montants de marché en location nue ET meublée.** La recherche n’a donc pas débloqué la collecte de production. Aucun abonnement, achat, inscription fournisseur ou contact commercial n’a été effectué. L’APK V21 et ses fonctions restent inchangés.

Le budget de données fixé par le propriétaire d’ImmOptima est de 0 €. Aucun compte fournisseur ne doit être imposé aux clients. La gratuité de consultation d’une page ne constitue pas un accès de production garanti. Les échecs d’accès, les références insuffisantes et les types de location absents doivent rester visibles.

## Ce qui a été testé réellement

Le programme `review-free-sources.py` a interrogé les métadonnées officielles data.gouv.fr, téléchargé le CSV national OLL 2025, ouvert l’archive détaillée de Tours 2025 et lu le CSV ANIL T1/T2 2025. Le fichier `free-sources-live-audit-2026-11-02.json` conserve les URL, codes HTTP, empreintes et résultats ; il ne contient aucune annonce individuelle ni donnée cliente.

Le CSV national contrôlé contient **10 104 lignes et 53 libellés d’agglomération distincts**. Il ne représente pas toutes les communes françaises. Les lignes sont des croisements statistiques : elles ne doivent pas être additionnées comme des annonces indépendantes.

Exemple OLL réellement lu : appartements d’une pièce dans l’agglomération de Tours, 2025, toutes anciennetés d’occupation et de construction confondues, **2 776 observations** :

| Mesure | Quartile bas | Médiane | Quartile haut |
| --- | --- | --- | --- |
| Loyer mensuel HC observé | 350 € | 393 € | 439 € |
| Loyer HC au m² | 13,0 € | 15,0 € | 17,9 € |

La surface moyenne de ce segment est de **27 m²**. Ces montants décrivent le segment de l’agglomération, sans promettre le loyer d’un studio précis de 20 m² ni une recherche d’annonces du jour. Les médianes mensuelles et au m² sont deux statistiques distinctes : multiplier l’une par la surface moyenne ne reconstitue pas nécessairement l’autre.

Le glossaire officiel OLL indique que les statistiques diffusées concernent les locations vides et excluent les meublés. Les colonnes des CSV national et de Tours contrôlés ne fournissent pas de ventilation nu/meublé. Elles ne permettent donc pas de fabriquer la deuxième ligne du comparatif.

Le fichier ANIL T1/T2 contrôlé contient **34 900 communes**. Pour Tours, le point publié est d’environ **15,46 €/m² CC**, avec un intervalle de prédiction d’environ **12,59–18,98 €/m²**, pour un bien non meublé de référence de 37 m². Ce point est une prédiction du modèle : ce n’est pas une médiane, et ses bornes ne sont pas des quartiles observés. Elles ne doivent pas être renommées pour donner l’impression d’un comparatif d’annonces.

## Pistes supplémentaires examinées

| Source | Apport vérifié | Pourquoi elle ne résout pas seule la demande |
| --- | --- | --- |
| OLL national et fichiers locaux | Données ouvertes, vraies médianes et dispersion, accès direct sans clé | Location vide, territoires limités, données annuelles |
| ANIL / Carte des loyers | Socle communal ouvert, utilisé à partir de Leboncoin et SeLoger | Modèle non meublé pour biens types, pas une recherche d’annonces actuelles |
| Données d’encadrement Paris / Lyon | Valeurs publiques distinguant vide et meublé | Références réglementaires locales ; minoré/référence/majoré ne sont pas les trois quantiles d’un marché d’annonces. Ne pas étendre ces valeurs à Tours |
| Manda, statistiques par ville | À Tours, tableau de loyers moyens séparant nu/meublé et typologies, avec effectifs et date ; source annoncée Yanport | Les CGU exigent une autorisation de réutilisation des données. Les moyennes publiées ne suffisent pas à établir des médianes et bornes par mode. Aucun connecteur activé |
| Observatoire Antibes / réseau Dune Immo | Rapports réutilisables avec attribution, sans inscription | Indicateurs locaux, sans triplets nu/meublé comparables suffisants ; ne couvre pas la France |
| gratis-immo-inserate.ch | Flux d’annonces documenté, gratuit, sans clé et réutilisable | Couverture suisse annoncée ; pas une base française pour Tours |
| Enquête Logement SDES | Enquête riche sur les loyers et les logements | Les microdonnées utiles ont des conditions d’accès spécifiques ; aucun fichier commercialement réutilisable permettant une estimation locale nu/meublé n’a été validé ici |
| Immo Generation / Super Observatoire | API d’indices documentée | Transactions de vente DVF, pas des loyers ; quota gratuit par clé insuffisant pour ce besoin |
| Sites d’annonces grand public | Des annonces meublées existent bien et sont consultables | Aucun nouvel accès gratuit de réutilisation en production validé ; ne pas annoncer un collecteur Leboncoin/SeLoger opérationnel |

## Voie gratuite concrète à tenter pour le meublé

Une **autorisation gratuite de réutilisation de statistiques agrégées**, accordée par un éditeur disposant effectivement des droits, pourrait compléter le socle public. Elle éviterait un abonnement et tout compte fournisseur côté client. L’existence d’une page publique ne garantit pas cet accord : il faut également vérifier les champs fournis, les villes couvertes, les quantiles réellement disponibles, la périodicité et les droits des sources tierces.

Une demande prête à relire est conservée dans `DEMANDE_ACCES_GRATUIT_STATISTIQUES.md`. Elle n’a pas été envoyée. Aucun engagement ni partage de portefeuille client n’est prévu par ce brouillon. Sans accord et sans données effectivement reçues, cette piste reste non validée.

Il est techniquement possible de conserver un extrait public dans l’APK pour survivre à une panne réseau, avec le millésime toujours visible. Ce mécanisme améliore la disponibilité d’un repère existant ; il ne crée pas de références meublées manquantes et ne transforme pas un ancien résultat en observation du jour. Il n’a pas été ajouté à la V21 dans cette recherche.

## Sources principales consultées

- https://www.data.gouv.fr/datasets/resultats-nationaux-des-observatoires-locaux-des-loyers
- https://www.data.gouv.fr/datasets/resultats-des-observatoires-locaux-des-loyers-par-agglomeration
- https://www.observatoires-des-loyers.org/a-propos-des-donnees/glossaire-de-lobservation-des-loyers
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025
- https://opendata.paris.fr/explore/dataset/logement-encadrement-des-loyers/
- https://www.data.gouv.fr/datasets/encadrement-des-loyers-de-la-metropole-de-lyon-2025-2026
- https://public.manda.fr/estimation-loyer/tours-37000
- https://public.manda.fr/conditions-generales-utilisation
- https://www.antibes-appartement.com/conditions-generales-vente
- https://www.antibes-appartement.com/observatoire-marche-immobilier-antibes-2026
- https://gratis-immo-inserate.ch/fr/partner
- https://www.statistiques.developpement-durable.gouv.fr/enquete-logement-enl
- https://immogeneration42.com/observatoire/developpeurs/
