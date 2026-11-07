# Optimisation locative — vérification du 7 novembre 2026

Le nouveau bouton principal « Gérer le bien » est approuvé et intégré séparément. La maquette d’Optimisation demeure une proposition ; ses huit annonces et ses montants sont fictifs.

## Solution gratuite confirmée pour un premier avis automatique

Les jeux de données ANIL et OLL sont disponibles publiquement et se prêtent à une récupération sans saisie de références par le client. Ces sources sont déjà partiellement exploitées dans le code : il ne s’agit pas d’une nouvelle collecte d’annonces activée.

- OLL : loyers observés, type de logement, pièces et ancienneté d’occupation ; privilégier les nouveaux emménagés lorsqu’un segment exploitable est disponible, en conservant le millésime et la taille d’échantillon.
- Données locales : la publication OLL37 des résultats 2025 a été publiée par l’ATU le 6 octobre 2026 et par le réseau OLL le 13 octobre 2026. La couverture mentionne Tours et Chambray-lès-Tours. Une publication récente ne transforme pas les observations 2025 en annonces disponibles aujourd’hui.
- ANIL : repère national complémentaire par commune ; le logement type T1/T2 mesure 37 m². Le montant est charges comprises. Il ne doit pas être assimilé à un loyer HC observé pour un studio de 16 m².
- Une fourchette peut être affichée automatiquement lorsque le périmètre, la surface et l’échantillon sont suffisamment comparables. Sinon, l’interface doit conserver « données insuffisantes », sans demander une cible manuelle pour masquer le manque de données.
- Meublé : les références réellement meublées et une simulation à partir du nu doivent rester identifiées séparément. Aucune majoration locale ne peut être déclarée observée sans source.

## Limite restant ouverte

Aucun nouveau flux gratuit d’annonces récentes n’a été activé par cette vérification. Le fournisseur existant exige une activation et un accès à confirmer ; les anciens audits des autres sources ne prouvent pas une disponibilité de production. Une récupération automatisée fiable d’annonces récentes reste un besoin distinct du premier avis statistique gratuit.

## Proposition fonctionnelle à soumettre

Réutiliser les caractéristiques du bien ; actualiser les sources publiques automatiquement ; restituer le repère ou la fourchette, la source, l’année et la qualité du rapprochement ; comparer au loyer actuel lorsqu’une base HC cohérente existe. Garder les possibilités de révision et de changement de bail séparées de la cible de marché. La nouvelle interface d’Optimisation n’est pas intégrée à ce stade.

Sources consultées :
- https://www.data.gouv.fr/datasets/resultats-nationaux-des-observatoires-locaux-des-loyers/
- https://www.observatoires-des-loyers.org/connaitre-les-loyers/carte-des-niveaux-de-loyers/agglomeration-de-tours
- https://www.observatoires-des-loyers.org/connaitre-les-loyers/carte-des-niveaux-de-loyers/agglomeration-de-tours/tours-37261
- https://www.atu37.fr/productions/lobservatoire-local-des-loyers-du-parc-prive-de-tours-metropole-val-de-loire-2/
- https://www.observatoires-des-loyers.org/decouvrir-le-reseau/publications/details/metropole-tourangelle-resultats-2025
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025/
- https://portail.documentation.developpement-durable.gouv.fr/pub/MPDOUV00268491-guide-utilisation-carte-des-loyers.html
