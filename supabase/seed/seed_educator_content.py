"""
Educator-crafted seed content for Frensify.
Authentic TEF/TCF exam-style questions and exercises.

Run:  cd supabase/seed && .venv/Scripts/python seed_educator_content.py
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(Path(__file__).parent.parent.parent / "backend" / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# ---------------------------------------------------------------------------
# TCF READING — Compréhension écrite (20 questions, A1→C1)
# ---------------------------------------------------------------------------
TCF_READING = [
    # --- A1 (5 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "BIBLIOTHÈQUE MUNICIPALE\nHoraires d'ouverture :\nLundi – Vendredi : 9 h – 18 h\nSamedi : 10 h – 16 h\nDimanche : Fermé\nInscription gratuite sur présentation d'une pièce d'identité.",
        "prompt": "Quand la bibliothèque est-elle fermée ?",
        "choices": ["Le samedi après-midi", "Le dimanche", "Le lundi matin", "Le vendredi soir"],
        "correct_index": 1,
        "explanation": "Le panneau indique clairement « Dimanche : Fermé »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "SOLDES D'ÉTÉ — Jusqu'à -50 % sur toute la collection printemps-été. Offre valable du 25 juin au 19 juillet. Conditions en magasin.",
        "prompt": "De combien est la réduction maximale ?",
        "choices": ["25 %", "19 %", "50 %", "75 %"],
        "correct_index": 2,
        "explanation": "L'annonce indique « Jusqu'à -50 % »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "Menu du jour – 12,50 €\nEntrée : Soupe à l'oignon\nPlat : Poulet rôti avec légumes de saison\nDessert : Tarte aux pommes\nBoisson non comprise.",
        "prompt": "Que comprend le menu du jour ?",
        "choices": [
            "Une entrée, un plat et une boisson",
            "Une entrée, un plat et un dessert",
            "Un plat et un dessert uniquement",
            "Deux plats et un dessert"
        ],
        "correct_index": 1,
        "explanation": "Le menu inclut entrée, plat et dessert. La boisson n'est pas comprise."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "Cher Paul,\nJe suis arrivée à Lyon hier. L'hôtel est très bien. Demain, je visite le Vieux-Lyon avec Marie. Il fait beau !\nÀ bientôt,\nSophie",
        "prompt": "Où est Sophie en ce moment ?",
        "choices": ["À Paris", "À Lyon", "À Marseille", "À la maison"],
        "correct_index": 1,
        "explanation": "Sophie écrit « Je suis arrivée à Lyon hier »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "PHARMACIE DE GARDE\nCe week-end : Pharmacie Duval\n15, rue Victor Hugo\nTél. : 01 42 33 55 78\nOuverte samedi et dimanche de 9 h à 20 h.",
        "prompt": "Quel est le numéro de téléphone de la pharmacie de garde ?",
        "choices": ["01 42 33 55 87", "01 42 33 55 78", "01 42 35 53 78", "01 44 33 55 78"],
        "correct_index": 1,
        "explanation": "Le numéro affiché est 01 42 33 55 78."
    },
    # --- A2 (5 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Objet : Annulation de cours\n\nChers étudiants,\nLe cours de grammaire française du jeudi 14 mars est annulé en raison de l'absence de Mme Leroy. Le cours sera rattrapé le lundi 18 mars à 14 h en salle B204.\nCordialement,\nLe secrétariat",
        "prompt": "Pourquoi le cours est-il annulé ?",
        "choices": [
            "La salle n'est pas disponible",
            "Il y a une grève des transports",
            "La professeure est absente",
            "C'est un jour férié"
        ],
        "correct_index": 2,
        "explanation": "Le courriel précise « en raison de l'absence de Mme Leroy »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Colocataire recherché(e)\nAppartement de 70 m², 3 pièces, quartier Saint-Michel. Chambre meublée de 14 m² avec vue sur jardin. Loyer : 480 €/mois charges comprises. Non-fumeur(se) souhaité(e). Disponible à partir du 1er septembre. Contact : Julien, 06 78 12 34 56.",
        "prompt": "Quelle condition est mentionnée pour le ou la colocataire ?",
        "choices": [
            "Avoir un emploi stable",
            "Ne pas fumer",
            "Être étudiant(e)",
            "Avoir un animal de compagnie"
        ],
        "correct_index": 1,
        "explanation": "L'annonce précise « Non-fumeur(se) souhaité(e) »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "La ville de Nantes organise sa Fête de la Musique le 21 juin. Plus de 200 concerts gratuits auront lieu dans les rues, les parcs et les places du centre-ville. Les festivités commencent à 16 h et se terminent à minuit. Le tramway sera gratuit toute la soirée à partir de 18 h.",
        "prompt": "À quelle heure le tramway devient-il gratuit ?",
        "choices": ["À 16 h", "À 18 h", "À 20 h", "À minuit"],
        "correct_index": 1,
        "explanation": "Le texte indique que le tramway est gratuit « à partir de 18 h »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Madame, Monsieur,\n\nJe vous écris pour signaler un problème avec ma commande n° 78432. J'ai reçu un pull bleu taille M alors que j'avais commandé un pull rouge taille L. Je souhaite un échange ou un remboursement.\n\nCordialement,\nMarc Dupont",
        "prompt": "Quel est le problème de Marc ?",
        "choices": [
            "Il n'a pas reçu sa commande",
            "Le produit reçu ne correspond pas à sa commande",
            "Le produit est abîmé",
            "Il a reçu une facture incorrecte"
        ],
        "correct_index": 1,
        "explanation": "Marc a reçu un article de mauvaise couleur et de mauvaise taille."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Le parc animalier de Thoiry propose une nouvelle attraction : un safari en voiture électrique à travers la réserve africaine. Le parcours dure environ 45 minutes. Tarif adulte : 18 €. Tarif enfant (3-12 ans) : 12 €. Gratuit pour les moins de 3 ans. Réservation obligatoire sur le site internet.",
        "prompt": "Combien coûte l'entrée pour un enfant de 8 ans ?",
        "choices": ["Gratuit", "12 €", "15 €", "18 €"],
        "correct_index": 1,
        "explanation": "Le tarif enfant (3-12 ans) est de 12 €. Un enfant de 8 ans entre dans cette catégorie."
    },
    # --- B1 (4 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "Le covoiturage connaît un essor remarquable en France. En cinq ans, le nombre d'utilisateurs réguliers a doublé, atteignant 3,5 millions de trajets mensuels. Les raisons de ce succès sont multiples : économies substantielles sur le carburant, souci écologique et convivialité du voyage partagé. Toutefois, certains usagers regrettent le manque de ponctualité de certains conducteurs et l'absence de réglementation claire en cas d'accident.",
        "prompt": "Quel inconvénient du covoiturage est mentionné dans le texte ?",
        "choices": [
            "Le prix élevé des trajets",
            "Le manque de ponctualité de certains conducteurs",
            "L'obligation d'avoir un permis de conduire",
            "La difficulté à trouver des passagers"
        ],
        "correct_index": 1,
        "explanation": "Le texte cite le manque de ponctualité et l'absence de réglementation comme inconvénients."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "La mairie de Bordeaux a décidé de transformer une ancienne friche industrielle en jardin partagé. Les habitants du quartier pourront cultiver fruits et légumes sur des parcelles individuelles de 10 m². Le projet prévoit aussi un espace de compostage collectif et un petit verger. Les inscriptions sont ouvertes jusqu'au 30 avril et les parcelles seront attribuées par tirage au sort.",
        "prompt": "Comment les parcelles seront-elles attribuées ?",
        "choices": [
            "Par ordre d'inscription",
            "Selon le revenu des familles",
            "Par tirage au sort",
            "Aux résidents les plus anciens"
        ],
        "correct_index": 2,
        "explanation": "Le texte précise que « les parcelles seront attribuées par tirage au sort »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "Une étude menée par l'INSERM révèle que les Français dorment en moyenne 6 h 42 par nuit, soit 1 h 30 de moins qu'il y a cinquante ans. Les écrans sont identifiés comme la cause principale de ce recul : 73 % des 18-35 ans consultent leur téléphone dans les quinze minutes précédant le coucher. Les chercheurs recommandent d'éteindre tout appareil électronique au moins une heure avant de dormir.",
        "prompt": "Selon l'étude, quelle est la cause principale du manque de sommeil ?",
        "choices": [
            "Le stress au travail",
            "La consommation de café",
            "L'utilisation des écrans",
            "Le bruit urbain"
        ],
        "correct_index": 2,
        "explanation": "L'étude identifie les écrans comme la cause principale."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "Le système de vélos en libre-service Vélib' fête ses quinze ans à Paris. Depuis son lancement, plus de 300 millions de trajets ont été effectués. Le service compte désormais 20 000 vélos, dont 40 % sont électriques. La mairie envisage d'étendre le réseau à 50 communes supplémentaires en banlieue d'ici 2027. Le tarif annuel reste fixé à 37,60 € pour le forfait classique.",
        "prompt": "Quel pourcentage des vélos Vélib' est électrique ?",
        "choices": ["20 %", "30 %", "40 %", "50 %"],
        "correct_index": 2,
        "explanation": "Le texte indique que 40 % des vélos sont électriques."
    },
    # --- B2 (3 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "Le débat sur la semaine de quatre jours s'intensifie en France. Plusieurs entreprises pilotes ont adopté ce modèle sans réduction de salaire, constatant une hausse de la productivité de 20 % et une baisse de l'absentéisme. Les syndicats y voient un progrès social majeur, tandis que le patronat s'inquiète des surcoûts liés à la réorganisation des équipes. Les économistes, eux, rappellent que ce modèle fonctionne surtout dans le secteur tertiaire et reste difficilement applicable à l'industrie ou à la santé.",
        "prompt": "Quelle réserve les économistes émettent-ils à propos de la semaine de quatre jours ?",
        "choices": [
            "Elle provoque une baisse de la productivité",
            "Elle est surtout adaptée au secteur tertiaire",
            "Elle nécessite une réduction de salaire",
            "Elle augmente le taux d'absentéisme"
        ],
        "correct_index": 1,
        "explanation": "Les économistes soulignent que ce modèle fonctionne surtout dans le tertiaire."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "L'intelligence artificielle générative soulève des questions inédites dans le domaine de l'éducation. Certains enseignants voient dans ces outils une opportunité de personnaliser l'apprentissage, tandis que d'autres craignent qu'ils n'encouragent le plagiat et ne réduisent l'effort intellectuel des élèves. Le ministère de l'Éducation nationale a publié un cadre de recommandations qui encourage l'utilisation encadrée de l'IA tout en renforçant l'enseignement de l'esprit critique et de la vérification des sources.",
        "prompt": "Quelle est la position du ministère de l'Éducation nationale ?",
        "choices": [
            "Interdire totalement l'IA dans les établissements scolaires",
            "Laisser chaque enseignant décider librement",
            "Encourager un usage encadré de l'IA avec renforcement de l'esprit critique",
            "Remplacer progressivement les enseignants par des outils d'IA"
        ],
        "correct_index": 2,
        "explanation": "Le ministère encourage un usage encadré tout en renforçant l'esprit critique."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "Le tourisme de masse menace les sites naturels les plus fragiles de la planète. En France, les calanques de Marseille ont instauré un système de réservation obligatoire en été, limitant l'accès à 400 visiteurs par jour. Cette mesure, critiquée par les professionnels du tourisme qui y voient un frein économique, est saluée par les écologistes. Les premières données montrent une régénération visible de la flore sous-marine après seulement deux saisons de régulation.",
        "prompt": "Quel résultat concret la régulation a-t-elle produit ?",
        "choices": [
            "Une augmentation des recettes touristiques",
            "Une régénération de la flore sous-marine",
            "Une hausse du nombre de visiteurs",
            "Un accord entre écologistes et professionnels du tourisme"
        ],
        "correct_index": 1,
        "explanation": "Le texte mentionne une régénération visible de la flore sous-marine."
    },
    # --- C1 (3 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "La notion de « sobriété numérique » gagne du terrain dans le discours public français. Longtemps occulté par l'image immatérielle du cloud, l'impact environnemental du numérique représente désormais 4 % des émissions mondiales de gaz à effet de serre, soit davantage que le transport aérien civil. L'ADEME préconise d'allonger la durée de vie des équipements, de rationaliser le stockage de données et de limiter le streaming vidéo haute définition. Néanmoins, les détracteurs de cette approche estiment qu'elle risque de freiner l'innovation et de creuser la fracture numérique dans les territoires ruraux.",
        "prompt": "Quel argument avancent les détracteurs de la sobriété numérique ?",
        "choices": [
            "Le numérique ne pollue pas autant qu'on le prétend",
            "Elle pourrait freiner l'innovation et aggraver la fracture numérique",
            "Le streaming vidéo est indispensable à l'économie",
            "L'ADEME n'a pas la compétence pour se prononcer"
        ],
        "correct_index": 1,
        "explanation": "Les détracteurs craignent un frein à l'innovation et un creusement de la fracture numérique."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "L'essor des « tiers-lieux » redessine la géographie du travail en France. Ces espaces hybrides — mi-bureaux partagés, mi-lieux de vie — se multiplient dans les petites villes et les zones rurales, attirant des télétravailleurs en quête de lien social sans retour quotidien au siège de leur entreprise. Une étude de France Stratégie chiffre à 3 500 le nombre de tiers-lieux actifs sur le territoire, dont 40 % ont été créés après 2020. Au-delà de la simple mise à disposition de postes de travail, ces structures proposent souvent des ateliers de fabrication numérique, des programmes d'accompagnement entrepreneurial et des événements culturels, contribuant ainsi à la revitalisation de communes en déclin démographique.",
        "prompt": "Quelle fonction des tiers-lieux dépasse la simple mise à disposition de bureaux ?",
        "choices": [
            "La vente de produits technologiques aux résidents",
            "L'hébergement touristique pour les travailleurs nomades",
            "Des ateliers de fabrication numérique et un accompagnement entrepreneurial",
            "La gestion administrative des communes rurales"
        ],
        "correct_index": 2,
        "explanation": "Le texte cite des ateliers de fabrication numérique, des programmes d'accompagnement entrepreneurial et des événements culturels."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "La « fast fashion » est de plus en plus contestée par les jeunes consommateurs français. Paradoxalement, ce sont ces mêmes tranches d'âge qui alimentent la croissance fulgurante des plateformes de mode ultra-rapide venues d'Asie. Les sociologues expliquent cette dissonance par la coexistence de deux logiques : une adhésion sincère aux valeurs écologiques et une pression sociale intense à renouveler son image, amplifiée par les réseaux sociaux. Le gouvernement français a proposé un projet de loi imposant un malus environnemental sur les articles vendus à moins de cinq euros, mesure qualifiée d'insuffisante par les ONG et de protectionniste par les plateformes concernées.",
        "prompt": "Comment les sociologues expliquent-ils le comportement paradoxal des jeunes consommateurs ?",
        "choices": [
            "Par un manque d'information sur les enjeux écologiques",
            "Par la coexistence de valeurs écologiques et d'une pression sociale à renouveler son image",
            "Par une préférence assumée pour les prix bas",
            "Par l'absence d'alternatives durables sur le marché"
        ],
        "correct_index": 1,
        "explanation": "Les sociologues évoquent la coexistence d'une adhésion écologique et d'une pression sociale à renouveler son image."
    },
]

# ---------------------------------------------------------------------------
# TEF READING — Compréhension écrite (20 questions, A1→C1)
# ---------------------------------------------------------------------------
TEF_READING = [
    # --- A1 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "CABINET MÉDICAL Dr FAURE\nConsultations sur rendez-vous uniquement\nLundi, mercredi, vendredi : 8 h 30 – 12 h / 14 h – 18 h\nMardi et jeudi : 8 h 30 – 12 h\nTél. : 04 91 22 33 44",
        "prompt": "Peut-on consulter le Dr Faure le mardi après-midi ?",
        "choices": ["Oui, de 14 h à 18 h", "Non, le cabinet est fermé l'après-midi", "Oui, mais sans rendez-vous", "Seulement en cas d'urgence"],
        "correct_index": 1,
        "explanation": "Le mardi, les consultations sont uniquement de 8 h 30 à 12 h."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "Cher Karim,\nMerci pour ton invitation. Je serai à Montréal le 15 décembre. Mon avion arrive à 10 h 20. Est-ce que tu peux venir me chercher à l'aéroport ?\nÀ bientôt,\nFatima",
        "prompt": "Que demande Fatima à Karim ?",
        "choices": [
            "De réserver un hôtel",
            "De venir la chercher à l'aéroport",
            "D'acheter un billet d'avion",
            "De l'accompagner à Montréal"
        ],
        "correct_index": 1,
        "explanation": "Fatima demande à Karim de venir la chercher à l'aéroport."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "PISCINE MUNICIPALE\nEntrée adulte : 5,50 €\nEntrée enfant (-12 ans) : 3,00 €\nCarte 10 séances adulte : 45 €\nBonnet de bain obligatoire",
        "prompt": "Que faut-il obligatoirement porter à la piscine ?",
        "choices": ["Des lunettes de natation", "Un bonnet de bain", "Un maillot de bain neuf", "Des sandales"],
        "correct_index": 1,
        "explanation": "Le panneau indique « Bonnet de bain obligatoire »."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A1",
        "passage": "PROMOTION\nPizza Margherita : 8,90 € au lieu de 11,50 €\n1 pizza achetée = 1 boisson offerte\nOffre valable uniquement le mardi soir, sur place.",
        "prompt": "Quand peut-on profiter de cette offre ?",
        "choices": ["Tous les jours", "Le mardi soir uniquement", "Le week-end", "À midi seulement"],
        "correct_index": 1,
        "explanation": "L'offre est valable « uniquement le mardi soir »."
    },
    # --- A2 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "La Ville de Québec organise son marché de Noël du 28 novembre au 23 décembre sur la place de l'Hôtel-de-Ville. Vous y trouverez des produits artisanaux, des spécialités culinaires régionales et des animations pour toute la famille. Entrée libre. Le marché est ouvert de 11 h à 21 h du jeudi au dimanche.",
        "prompt": "Combien coûte l'entrée au marché de Noël ?",
        "choices": ["5 €", "10 €", "C'est gratuit", "Le prix varie selon les jours"],
        "correct_index": 2,
        "explanation": "Le texte précise « Entrée libre », c'est-à-dire gratuit."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Bonjour Madame Martin,\n\nJe vous informe que votre colis n° TR-88451 est arrivé à notre bureau de poste. Comme vous étiez absente lors de la livraison, il sera conservé pendant 15 jours. Merci de vous présenter avec une pièce d'identité.\n\nLa Poste – Bureau de Villeneuve",
        "prompt": "Pourquoi le colis est-il au bureau de poste ?",
        "choices": [
            "Madame Martin a demandé une livraison au bureau",
            "Le colis est trop lourd pour être livré à domicile",
            "Madame Martin était absente lors de la livraison",
            "L'adresse de livraison était incorrecte"
        ],
        "correct_index": 2,
        "explanation": "Le message indique qu'elle était absente lors de la livraison."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Notre école de langues propose des cours de français pour tous les niveaux, du débutant à l'avancé. Les cours ont lieu en petits groupes de 8 personnes maximum. Nous offrons aussi des cours particuliers et des ateliers de conversation le samedi matin. Premier cours d'essai gratuit.",
        "prompt": "Combien de personnes maximum y a-t-il par groupe ?",
        "choices": ["5", "8", "10", "15"],
        "correct_index": 1,
        "explanation": "Les cours sont en petits groupes de 8 personnes maximum."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "A2",
        "passage": "Avis aux résidents de l'immeuble :\nLes travaux de rénovation de l'ascenseur commenceront le lundi 6 mars et dureront environ trois semaines. Pendant cette période, veuillez utiliser les escaliers. Nous nous excusons pour la gêne occasionnée.\nLe syndic",
        "prompt": "Combien de temps les travaux dureront-ils environ ?",
        "choices": ["Une semaine", "Deux semaines", "Trois semaines", "Un mois"],
        "correct_index": 2,
        "explanation": "L'avis indique que les travaux dureront « environ trois semaines »."
    },
    # --- B1 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "Le gouvernement canadien a annoncé un nouveau programme d'aide pour les jeunes entrepreneurs immigrants. Les candidats admissibles pourront obtenir un prêt sans intérêt allant jusqu'à 50 000 dollars pour lancer leur entreprise. Le programme exige un plan d'affaires détaillé et une résidence permanente valide. Les demandes seront acceptées à compter du 1er avril.",
        "prompt": "Quelle condition est requise pour accéder au programme ?",
        "choices": [
            "Avoir la citoyenneté canadienne",
            "Avoir moins de 25 ans",
            "Posséder une résidence permanente valide",
            "Avoir déjà créé une entreprise"
        ],
        "correct_index": 2,
        "explanation": "Le programme exige un plan d'affaires et une résidence permanente valide."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "Le télétravail s'est imposé durablement dans les habitudes des salariés français. Selon un récent sondage, 62 % des cadres pratiquent le télétravail au moins un jour par semaine. Si la majorité apprécie la flexibilité offerte, 35 % des répondants mentionnent un sentiment d'isolement et une difficulté à séparer vie professionnelle et vie personnelle. Les entreprises tentent de trouver un équilibre en proposant un modèle hybride de deux à trois jours au bureau.",
        "prompt": "Quel problème est souvent cité par les télétravailleurs ?",
        "choices": [
            "Un manque de matériel informatique",
            "Des salaires insuffisants",
            "Un sentiment d'isolement",
            "Des problèmes de connexion internet"
        ],
        "correct_index": 2,
        "explanation": "35 % des répondants mentionnent un sentiment d'isolement."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "La ville de Lyon a inauguré son premier « corridor de biodiversité » reliant deux grands parcs urbains. Ce couloir vert de 4 kilomètres, bordé de haies et de prairies fleuries, permet aux insectes pollinisateurs et aux petits mammifères de circuler librement. Des nichoirs à oiseaux et des hôtels à insectes ont été installés tous les 200 mètres. Le projet a été financé à 60 % par la région et à 40 % par des fonds européens.",
        "prompt": "À quoi sert principalement le corridor de biodiversité ?",
        "choices": [
            "À créer une piste cyclable entre deux parcs",
            "À permettre la circulation de la faune entre deux espaces verts",
            "À offrir un espace de promenade aux habitants",
            "À réduire la pollution sonore du centre-ville"
        ],
        "correct_index": 1,
        "explanation": "Le corridor permet aux insectes et petits mammifères de circuler entre les parcs."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B1",
        "passage": "Le musée des Beaux-Arts de Montréal propose une nouvelle exposition temporaire consacrée à l'art autochtone contemporain. L'exposition, qui réunit les œuvres de 40 artistes des Premières Nations, des Inuits et des Métis, sera visible du 15 janvier au 30 avril. Des visites guidées en français et en anglais sont offertes chaque samedi à 14 h. Le tarif est de 24 $ pour les adultes, gratuit pour les moins de 18 ans.",
        "prompt": "Pour qui l'exposition est-elle gratuite ?",
        "choices": [
            "Les étudiants universitaires",
            "Les personnes de plus de 65 ans",
            "Les moins de 18 ans",
            "Tous les visiteurs le samedi"
        ],
        "correct_index": 2,
        "explanation": "L'exposition est gratuite pour les moins de 18 ans."
    },
    # --- B2 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "L'agriculture urbaine se développe rapidement au Québec. Des fermes verticales utilisant l'hydroponie produisent désormais des laitues et des herbes aromatiques en plein cœur de Montréal, toute l'année. Les partisans de cette approche soulignent la réduction des émissions liées au transport et l'absence de pesticides. Les critiques, en revanche, pointent la consommation énergétique élevée des systèmes d'éclairage artificiel et le coût prohibitif des installations, qui rend les produits inaccessibles aux ménages à faible revenu.",
        "prompt": "Quel reproche est formulé à l'encontre de l'agriculture urbaine ?",
        "choices": [
            "La qualité nutritive des aliments est inférieure",
            "Les produits utilisent des pesticides chimiques",
            "La consommation énergétique est élevée et les coûts excluent les ménages modestes",
            "Les fermes verticales occupent trop d'espace en ville"
        ],
        "correct_index": 2,
        "explanation": "Les critiques pointent la consommation énergétique et le coût prohibitif."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "Le Québec fait face à une pénurie de main-d'œuvre sans précédent dans le secteur de la santé. Malgré les efforts de recrutement international, les délais d'obtention du permis d'exercice pour les médecins et infirmiers formés à l'étranger restent considérables — parfois plus de deux ans. Le gouvernement provincial a récemment adopté un projet de loi pour accélérer la reconnaissance des diplômes étrangers, tout en maintenant les normes de compétence exigées par les ordres professionnels.",
        "prompt": "Quel obstacle majeur ralentit l'intégration des professionnels de santé étrangers ?",
        "choices": [
            "Le manque de postes disponibles dans les hôpitaux",
            "Les longs délais de reconnaissance des diplômes étrangers",
            "Le faible niveau de français des candidats",
            "L'absence de programme de recrutement international"
        ],
        "correct_index": 1,
        "explanation": "Les délais d'obtention du permis d'exercice peuvent dépasser deux ans."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "La francophonie mondiale compte désormais 321 millions de locuteurs, selon le dernier rapport de l'Organisation internationale de la Francophonie. C'est en Afrique subsaharienne que la croissance est la plus forte, portée par la démographie et l'expansion de la scolarisation. Cependant, la qualité de l'enseignement du français reste inégale selon les pays, et la concurrence de l'anglais dans les domaines scientifique et technologique pousse certains gouvernements à adopter des politiques linguistiques bilingues.",
        "prompt": "Pourquoi certains pays francophones adoptent-ils des politiques bilingues ?",
        "choices": [
            "Parce que le nombre de francophones diminue",
            "En raison de la concurrence de l'anglais dans les sciences et la technologie",
            "Pour attirer les touristes anglophones",
            "À cause de la pression de l'Organisation internationale de la Francophonie"
        ],
        "correct_index": 1,
        "explanation": "La concurrence de l'anglais dans les domaines scientifique et technologique motive ces politiques."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "B2",
        "passage": "Les bibliothèques publiques canadiennes réinventent leur rôle. Au-delà du prêt de livres, elles deviennent des espaces communautaires proposant des cours de langue, des ateliers de codage, des consultations juridiques gratuites et même le prêt d'outils et de jeux de société. Cette transformation vise à lutter contre l'exclusion sociale et à offrir aux citoyens un accès équitable aux ressources, quel que soit leur niveau de revenu. Les bibliothécaires, formés à l'accueil de publics diversifiés, jouent désormais un rôle de travailleurs sociaux de proximité.",
        "prompt": "Quel nouveau rôle les bibliothèques canadiennes assument-elles ?",
        "choices": [
            "Elles se spécialisent dans les publications numériques",
            "Elles deviennent des espaces communautaires de lutte contre l'exclusion sociale",
            "Elles remplacent les centres de formation professionnelle",
            "Elles organisent des événements payants pour se financer"
        ],
        "correct_index": 1,
        "explanation": "Les bibliothèques deviennent des espaces communautaires luttant contre l'exclusion sociale."
    },
    # --- C1 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "Le concept d'« éco-anxiété » a fait son entrée dans le vocabulaire médical francophone. Définie comme une détresse chronique liée à la dégradation de l'environnement, elle touche particulièrement les 16-25 ans. Une enquête menée dans dix pays, dont le Canada et la France, révèle que 75 % des jeunes interrogés considèrent l'avenir comme « effrayant ». Les psychologues plaident pour une prise en charge spécifique, distincte de l'anxiété généralisée, tout en soulignant que cette détresse peut aussi être un moteur d'engagement civique. Le risque, préviennent-ils, est que le sentiment d'impuissance l'emporte sur la volonté d'agir.",
        "prompt": "Selon les psychologues, quel risque accompagne l'éco-anxiété ?",
        "choices": [
            "Qu'elle provoque un rejet total de la cause écologique",
            "Que le sentiment d'impuissance l'emporte sur la volonté d'agir",
            "Qu'elle soit confondue avec une dépression classique",
            "Que les jeunes quittent massivement leur pays"
        ],
        "correct_index": 1,
        "explanation": "Les psychologues préviennent que le sentiment d'impuissance peut l'emporter sur la volonté d'agir."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "La loi québécoise sur la laïcité de l'État, adoptée en 2019, continue de susciter un vif débat. Ses défenseurs invoquent le principe de neutralité religieuse de l'État et la séparation entre les sphères publique et privée. Ses opposants, quant à eux, dénoncent une atteinte aux libertés individuelles et un effet discriminatoire disproportionné sur les femmes musulmanes portant le hijab, qui se voient interdire l'accès à certains postes de la fonction publique. Les tribunaux ont été saisis à plusieurs reprises, et la Cour supérieure a maintenu l'essentiel de la loi tout en invalidant certaines dispositions applicables aux commissions scolaires anglophones.",
        "prompt": "Que reprochent les opposants à la loi sur la laïcité ?",
        "choices": [
            "Elle ne va pas assez loin dans la séparation État-religion",
            "Elle favorise une religion au détriment des autres",
            "Elle porte atteinte aux libertés individuelles et touche disproportionnellement les femmes musulmanes",
            "Elle empêche tout débat public sur la religion"
        ],
        "correct_index": 2,
        "explanation": "Les opposants dénoncent une atteinte aux libertés et un effet discriminatoire envers les femmes musulmanes."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "L'économie circulaire s'impose progressivement comme un paradigme alternatif à la logique linéaire « extraire, produire, jeter ». En France, la loi anti-gaspillage de 2020 interdit la destruction des invendus non alimentaires et impose un indice de réparabilité sur cinq catégories de produits électroniques. Si les grandes enseignes affichent des progrès en matière de recyclage, les associations de consommateurs soulignent que la réparabilité réelle reste faible : pièces détachées coûteuses, documentation technique inaccessible et obsolescence programmée à peine voilée. Le véritable enjeu, selon les chercheurs, réside dans la transformation des modèles économiques, passant de la vente de produits à la vente d'usages.",
        "prompt": "Selon les chercheurs, quel est le véritable enjeu de l'économie circulaire ?",
        "choices": [
            "Augmenter le taux de recyclage des déchets ménagers",
            "Passer de la vente de produits à la vente d'usages",
            "Interdire l'importation de produits non recyclables",
            "Subventionner les entreprises qui réparent les appareils"
        ],
        "correct_index": 1,
        "explanation": "Les chercheurs soulignent la nécessité de passer de la vente de produits à la vente d'usages."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-ecrite",
        "difficulty": "C1",
        "passage": "Le bilinguisme officiel du Canada, inscrit dans la Loi sur les langues officielles de 1969, fait l'objet d'une modernisation attendue depuis longtemps. Le projet de loi C-13, adopté en 2023, reconnaît pour la première fois le caractère minoritaire du français en Amérique du Nord et impose aux entreprises fédérales de respecter le droit de travailler en français. Les communautés francophones hors Québec saluent cette avancée, tout en rappelant que le financement des institutions francophones — écoles, tribunaux, services de santé — reste insuffisant pour endiguer l'assimilation linguistique qui se poursuit dans plusieurs provinces.",
        "prompt": "Que réclament les communautés francophones hors Québec malgré l'adoption du projet de loi ?",
        "choices": [
            "L'indépendance linguistique de chaque province",
            "Un financement accru pour les institutions francophones",
            "L'abolition du bilinguisme officiel",
            "La fermeture des écoles anglophones en milieu francophone"
        ],
        "correct_index": 1,
        "explanation": "Les communautés francophones hors Québec demandent un meilleur financement des institutions francophones."
    },
]

# ---------------------------------------------------------------------------
# TCF LISTENING — Compréhension orale (20 questions, A1→C1)
# ---------------------------------------------------------------------------
TCF_LISTENING = [
    # --- A1 (5 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Mesdames et messieurs, votre attention s'il vous plaît. Le train à destination de Marseille partira voie numéro 3 dans dix minutes. Je répète : voie numéro 3.",
        "prompt": "De quelle voie le train va-t-il partir ?",
        "choices": ["Voie 1", "Voie 2", "Voie 3", "Voie 4"],
        "correct_index": 2,
        "explanation": "L'annonce indique « voie numéro 3 »."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Bonjour, vous êtes bien au cabinet du docteur Moreau. Le cabinet est fermé du 2 au 16 août. En cas d'urgence, veuillez appeler le 15. Merci.",
        "prompt": "Pourquoi ne peut-on pas voir le docteur Moreau ?",
        "choices": [
            "Il est en consultation",
            "Le cabinet est fermé pour vacances",
            "Il a déménagé",
            "Il faut prendre rendez-vous en ligne"
        ],
        "correct_index": 1,
        "explanation": "Le message indique que le cabinet est fermé du 2 au 16 août."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "— Bonjour, je voudrais deux croissants et une baguette, s'il vous plaît.\n— Voilà ! Ça fait 3 euros 20.\n— Tenez, voici 5 euros.\n— Et voici votre monnaie. Bonne journée !",
        "prompt": "Où cette conversation a-t-elle lieu ?",
        "choices": ["À la pharmacie", "Dans une boulangerie", "Au restaurant", "À la poste"],
        "correct_index": 1,
        "explanation": "On achète des croissants et une baguette, c'est une boulangerie."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Bonjour, c'est Nathalie. Je suis désolée, je ne pourrai pas venir ce soir. J'ai mal à la tête et je préfère me reposer. On se voit demain ? Bisous.",
        "prompt": "Pourquoi Nathalie ne viendra-t-elle pas ce soir ?",
        "choices": [
            "Elle doit travailler",
            "Elle ne se sent pas bien",
            "Elle a un autre rendez-vous",
            "Elle est en vacances"
        ],
        "correct_index": 1,
        "explanation": "Nathalie a mal à la tête et préfère se reposer."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Aujourd'hui, mardi 12 novembre, le temps sera nuageux sur toute la France avec des pluies abondantes dans le nord. Les températures seront comprises entre 8 et 12 degrés. Demain, retour du soleil.",
        "prompt": "Quel temps fait-il aujourd'hui dans le nord de la France ?",
        "choices": ["Il fait soleil", "Il neige", "Il pleut beaucoup", "Il fait très chaud"],
        "correct_index": 2,
        "explanation": "La météo annonce des pluies abondantes dans le nord."
    },
    # --- A2 (5 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "— Excusez-moi, pour aller à la gare, s'il vous plaît ?\n— Vous prenez la première rue à gauche, puis vous continuez tout droit pendant environ 200 mètres. La gare sera sur votre droite, juste après le pont.\n— Merci beaucoup !\n— De rien, c'est à cinq minutes à pied.",
        "prompt": "Où se trouve la gare exactement ?",
        "choices": [
            "Avant le pont, à gauche",
            "Après le pont, sur la droite",
            "En face du pont",
            "Au bout de la première rue à droite"
        ],
        "correct_index": 1,
        "explanation": "La gare est sur la droite, juste après le pont."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "— Allô, bonjour. Je voudrais réserver une table pour samedi soir, pour quatre personnes.\n— Samedi soir… à quelle heure ?\n— Vers 20 heures, c'est possible ?\n— Oui, pas de problème. C'est à quel nom ?\n— Bertrand. B-E-R-T-R-A-N-D.\n— C'est noté, Monsieur Bertrand. À samedi !",
        "prompt": "Combien de personnes viendront au restaurant ?",
        "choices": ["Deux", "Trois", "Quatre", "Cinq"],
        "correct_index": 2,
        "explanation": "La réservation est pour quatre personnes."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "Bonjour à tous ! Bienvenue au musée d'Orsay. La visite guidée commence dans cinq minutes. Je vous rappelle que les photos sans flash sont autorisées, mais il est interdit de toucher les œuvres. Les toilettes se trouvent au sous-sol. La boutique du musée est ouverte jusqu'à 18 heures. Merci de votre attention.",
        "prompt": "Qu'est-il interdit de faire dans le musée ?",
        "choices": [
            "Prendre des photos",
            "Toucher les œuvres",
            "Parler pendant la visite",
            "Acheter des souvenirs"
        ],
        "correct_index": 1,
        "explanation": "Il est interdit de toucher les œuvres."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "— Maman, est-ce que je peux aller au cinéma avec Lucas demain après-midi ?\n— C'est mercredi demain… tu as fait tes devoirs ?\n— Presque ! Il me reste juste l'exercice de maths.\n— D'accord, tu finis tes maths ce soir et tu peux y aller demain. Mais tu rentres avant 18 heures.\n— Promis ! Merci, Maman !",
        "prompt": "Quelle est la condition pour aller au cinéma ?",
        "choices": [
            "Ranger sa chambre",
            "Finir l'exercice de maths",
            "Accompagner sa mère au supermarché",
            "Rentrer avant 17 heures"
        ],
        "correct_index": 1,
        "explanation": "La mère demande de finir l'exercice de maths ce soir."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "Suite à l'incident technique survenu ce matin sur la ligne 4 du métro, le trafic est fortement perturbé entre les stations Châtelet et Montparnasse. Un service de bus de remplacement est mis en place. Nous vous prions de nous excuser pour la gêne occasionnée. Le retour à la normale est prévu vers 14 heures.",
        "prompt": "Que propose la RATP pour remplacer le métro ?",
        "choices": [
            "Des taxis gratuits",
            "Un service de bus de remplacement",
            "Un itinéraire alternatif en métro",
            "Des vélos en libre-service"
        ],
        "correct_index": 1,
        "explanation": "Un service de bus de remplacement est mis en place."
    },
    # --- B1 (4 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "— Alors, ton nouveau travail, ça se passe comment ?\n— Plutôt bien ! L'équipe est sympa et les horaires sont flexibles. Par contre, le trajet est vraiment long : une heure et quart en transports en commun. J'envisage de déménager pour me rapprocher.\n— Et le salaire, tu en es satisfait ?\n— Honnêtement, c'est un peu en dessous de ce que j'espérais, mais les perspectives d'évolution sont intéressantes. On m'a promis une réévaluation après six mois.",
        "prompt": "Quel est le principal inconvénient du nouveau travail ?",
        "choices": [
            "L'ambiance dans l'équipe",
            "Le temps de trajet",
            "Les horaires imposés",
            "L'absence de perspectives d'évolution"
        ],
        "correct_index": 1,
        "explanation": "Le trajet dure une heure et quart, ce qui pousse la personne à envisager un déménagement."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "Bienvenue dans notre émission « Planète verte ». Aujourd'hui, nous recevons Claire Dubois, fondatrice de l'application « Tri Malin ». Claire, pouvez-vous nous expliquer le concept ? « Oui, bien sûr. Tri Malin permet aux utilisateurs de scanner le code-barres d'un produit pour savoir dans quelle poubelle le jeter. L'application donne aussi des conseils pour réduire ses déchets au quotidien. On a déjà 500 000 téléchargements en six mois. »",
        "prompt": "Que permet de faire l'application « Tri Malin » ?",
        "choices": [
            "Commander des produits écologiques en ligne",
            "Savoir comment trier ses déchets correctement",
            "Calculer son empreinte carbone",
            "Trouver des magasins bio à proximité"
        ],
        "correct_index": 1,
        "explanation": "L'application indique dans quelle poubelle jeter un produit scanné."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "— Tu as entendu ? La mairie va construire un nouveau parking souterrain place de la République.\n— Sérieusement ? Encore un parking ? Moi, j'aurais préféré qu'ils agrandissent le parc ou qu'ils mettent des pistes cyclables.\n— Je suis d'accord, mais le problème du stationnement est réel. Mon voisin tourne parfois vingt minutes avant de trouver une place.\n— Oui, mais plus on construit de parkings, plus on encourage les gens à prendre la voiture. C'est un cercle vicieux.",
        "prompt": "Quel argument la deuxième personne utilise-t-elle contre le parking ?",
        "choices": [
            "Le parking coûte trop cher à construire",
            "Il encouragera davantage l'usage de la voiture",
            "Il n'y a pas de problème de stationnement",
            "La place de la République est trop petite"
        ],
        "correct_index": 1,
        "explanation": "La personne dit que plus de parkings encouragent l'usage de la voiture, un cercle vicieux."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "Chers auditeurs, les résultats de notre sondage de la semaine sont arrivés. Nous vous avions demandé : « Êtes-vous favorable à l'interdiction des téléphones portables au collège ? » Sur 12 000 répondants, 68 % ont répondu oui, 24 % ont répondu non et 8 % sont restés sans opinion. Beaucoup de parents estiment que le téléphone est une source de distraction, tandis que certains enseignants y voient un outil pédagogique utile s'il est bien encadré.",
        "prompt": "Quelle est la position majoritaire des répondants ?",
        "choices": [
            "Ils sont contre l'interdiction",
            "Ils sont favorables à l'interdiction",
            "Ils n'ont pas d'opinion",
            "Ils veulent une interdiction partielle"
        ],
        "correct_index": 1,
        "explanation": "68 % des répondants sont favorables à l'interdiction."
    },
    # --- B2 (3 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Aujourd'hui dans notre chronique économique, nous abordons le phénomène de la « grande démission ». Depuis 2022, la France connaît un nombre record de ruptures conventionnelles. Les secteurs les plus touchés sont la restauration, l'hôtellerie et le commerce de détail, où les conditions de travail sont souvent jugées difficiles pour des salaires modestes. Les sociologues y voient un changement de rapport au travail : les actifs, notamment les plus jeunes, ne cherchent plus un emploi à vie mais une activité qui fait sens. Les entreprises qui peinent à recruter doivent repenser leur proposition de valeur : flexibilité, autonomie et sens de la mission deviennent les nouveaux critères d'attractivité.",
        "prompt": "Selon les sociologues, qu'est-ce qui a changé dans le rapport au travail ?",
        "choices": [
            "Les salariés exigent des salaires beaucoup plus élevés",
            "Les actifs recherchent une activité qui a du sens plutôt qu'un emploi à vie",
            "Les jeunes refusent catégoriquement de travailler",
            "Les entreprises offrent trop de flexibilité"
        ],
        "correct_index": 1,
        "explanation": "Les actifs recherchent une activité qui fait sens, plus un emploi à vie."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Bonjour et bienvenue dans « Santé Magazine ». Nous parlons aujourd'hui du jeûne intermittent, une pratique qui consiste à alterner des périodes de prise alimentaire et des périodes de jeûne. La méthode la plus courante est le 16/8 : on ne mange que pendant une fenêtre de huit heures et on jeûne pendant les seize heures restantes. Les études montrent des effets positifs sur la régulation du poids et la sensibilité à l'insuline. Cependant, les nutritionnistes mettent en garde : cette pratique n'est pas adaptée à tout le monde, notamment aux personnes souffrant de troubles alimentaires, aux femmes enceintes et aux adolescents en croissance.",
        "prompt": "Pour qui le jeûne intermittent est-il déconseillé ?",
        "choices": [
            "Les sportifs de haut niveau",
            "Les personnes souffrant de troubles alimentaires",
            "Les personnes de plus de 60 ans",
            "Les travailleurs de nuit"
        ],
        "correct_index": 1,
        "explanation": "Les nutritionnistes le déconseillent aux personnes souffrant de troubles alimentaires, aux femmes enceintes et aux adolescents."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Dans le cadre de notre série sur l'innovation sociale, nous avons rencontré Amina Khelifi, directrice d'une épicerie solidaire à Roubaix. Son concept : proposer des produits alimentaires de qualité à prix réduit, en récupérant les invendus des supermarchés et des producteurs locaux. « Nos clients paient entre 10 et 30 % du prix normal, selon leurs revenus. Ce n'est pas de la charité, c'est de la dignité. Les gens choisissent eux-mêmes ce qu'ils mettent dans leur panier. » L'épicerie accueille aujourd'hui 350 familles et emploie 8 salariés en insertion professionnelle.",
        "prompt": "Comment le prix est-il déterminé dans cette épicerie ?",
        "choices": [
            "Tout le monde paie le même prix réduit",
            "Le prix varie selon les revenus du client",
            "Les produits sont gratuits pour les familles",
            "Le prix est fixé par les supermarchés partenaires"
        ],
        "correct_index": 1,
        "explanation": "Les clients paient entre 10 et 30 % du prix normal, selon leurs revenus."
    },
    # --- C1 (3 questions) ---
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Nous poursuivons notre dossier sur la désinformation en ligne. Selon un rapport de l'ARCOM, 45 % des Français déclarent avoir été confrontés à une fausse information au cours du dernier mois. Le phénomène est amplifié par les algorithmes de recommandation des réseaux sociaux, qui favorisent les contenus émotionnels et polarisants. L'éducation aux médias, intégrée dans les programmes scolaires depuis 2015, peine à produire des résultats mesurables. Certains chercheurs plaident pour une responsabilisation juridique des plateformes, tandis que d'autres craignent que toute régulation ne devienne un outil de censure.",
        "prompt": "Pourquoi certains chercheurs s'opposent-ils à la régulation des plateformes ?",
        "choices": [
            "Elle serait trop coûteuse à mettre en place",
            "Les plateformes s'autorégulent déjà efficacement",
            "Elle pourrait devenir un outil de censure",
            "L'éducation aux médias est suffisante"
        ],
        "correct_index": 2,
        "explanation": "Certains chercheurs craignent que la régulation ne devienne un outil de censure."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Conférence : « L'avenir de la ville ». Intervenante : Professeure Isabelle Caron. « La ville du XXIe siècle doit repenser son rapport à la chaleur. Avec le réchauffement climatique, les îlots de chaleur urbains deviennent un problème de santé publique majeur. Les surfaces bétonnées absorbent la chaleur pendant la journée et la restituent la nuit, empêchant le rafraîchissement naturel. Les solutions existent : végétalisation massive, toitures réfléchissantes, réseau de fontaines et d'espaces de brumisation. Mais l'enjeu principal reste l'urbanisme : il faut cesser d'imperméabiliser les sols et repenser la densité pour permettre la circulation de l'air. »",
        "prompt": "Selon la professeure Caron, quel est l'enjeu principal pour lutter contre la chaleur urbaine ?",
        "choices": [
            "Installer des climatiseurs dans les bâtiments publics",
            "Limiter la circulation automobile en été",
            "Repenser l'urbanisme pour permettre la circulation de l'air",
            "Déplacer les populations vers les zones rurales"
        ],
        "correct_index": 2,
        "explanation": "L'enjeu principal est l'urbanisme : cesser d'imperméabiliser les sols et repenser la densité."
    },
    {
        "exam_type": "TCF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Émission « Débat du jour ». Sujet : Faut-il rendre le vote obligatoire en France ? Premier intervenant : « L'abstention atteint des niveaux alarmants — 53 % aux dernières législatives. Le vote obligatoire, pratiqué en Belgique et en Australie, renforcerait la légitimité des élus et inciterait les partis à s'adresser à l'ensemble de l'électorat. » Second intervenant : « Le vote est un droit, pas un devoir. Obliger les citoyens à voter ne résoudra pas la crise de confiance envers les institutions. Au contraire, cela risque d'augmenter le vote blanc ou protestataire sans améliorer la qualité du débat démocratique. Il vaut mieux s'attaquer aux causes profondes de l'abstention : le sentiment d'impuissance et le manque de représentativité. »",
        "prompt": "Quel est l'argument principal du second intervenant contre le vote obligatoire ?",
        "choices": [
            "Le vote obligatoire est anticonstitutionnel",
            "Il ne résoudra pas la crise de confiance envers les institutions",
            "Il coûterait trop cher à mettre en place",
            "La Belgique et l'Australie ont abandonné ce système"
        ],
        "correct_index": 1,
        "explanation": "Le second intervenant estime que le vote obligatoire ne résoudra pas la crise de confiance."
    },
]

# ---------------------------------------------------------------------------
# TEF LISTENING — Compréhension orale (20 questions, A1→C1)
# ---------------------------------------------------------------------------
TEF_LISTENING = [
    # --- A1 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Bienvenue chez Intermarché. Le magasin fermera dans 15 minutes. Nous vous invitons à vous diriger vers les caisses. Merci de votre visite et à bientôt.",
        "prompt": "Que doivent faire les clients ?",
        "choices": [
            "Continuer leurs achats",
            "Se diriger vers les caisses",
            "Aller au rayon boulangerie",
            "Attendre l'ouverture du magasin"
        ],
        "correct_index": 1,
        "explanation": "Le magasin ferme dans 15 minutes, les clients doivent aller aux caisses."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "— Bonjour, un café et un jus d'orange, s'il vous plaît.\n— Vous désirez autre chose ?\n— Non, merci. Ça fait combien ?\n— 4 euros 50, s'il vous plaît.",
        "prompt": "Combien le client doit-il payer ?",
        "choices": ["3,50 €", "4,00 €", "4,50 €", "5,00 €"],
        "correct_index": 2,
        "explanation": "Le serveur dit « 4 euros 50 »."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Salut Thomas, c'est Marie. Je suis à l'aéroport de Montréal. Mon vol a du retard, j'arrive à 16 heures au lieu de 14 heures. Ne viens pas trop tôt ! À tout à l'heure.",
        "prompt": "À quelle heure Marie arrivera-t-elle finalement ?",
        "choices": ["À 12 heures", "À 14 heures", "À 16 heures", "À 18 heures"],
        "correct_index": 2,
        "explanation": "Marie dit qu'elle arrive à 16 heures au lieu de 14 heures."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A1",
        "passage": "Attention, la piscine est réservée aux enfants de 10 heures à midi. L'accès au grand bassin est interdit aux moins de 12 ans sans accompagnateur adulte.",
        "prompt": "Jusqu'à quelle heure la piscine est-elle réservée aux enfants ?",
        "choices": ["10 heures", "11 heures", "Midi", "14 heures"],
        "correct_index": 2,
        "explanation": "La piscine est réservée aux enfants de 10 heures à midi."
    },
    # --- A2 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "— Bonjour, je voudrais m'inscrire à un cours de français.\n— Bien sûr ! Nous avons des cours du soir, le mardi et le jeudi, de 18 h à 20 h. Il reste quelques places dans le groupe intermédiaire.\n— C'est parfait, c'est exactement mon niveau. Combien ça coûte ?\n— 280 dollars pour la session de 12 semaines. Le premier cours est le mardi 10 septembre.",
        "prompt": "Quand commencent les cours ?",
        "choices": [
            "Le lundi 10 septembre",
            "Le mardi 10 septembre",
            "Le jeudi 12 septembre",
            "Le samedi 14 septembre"
        ],
        "correct_index": 1,
        "explanation": "Le premier cours est le mardi 10 septembre."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "— Tu as passé un bon week-end ?\n— Oui, super ! Samedi, je suis allée à une fête d'anniversaire chez mon amie Léa. Et dimanche, on a fait une randonnée au Mont-Royal. Il faisait un temps magnifique.\n— Ah, j'aurais aimé venir ! Moi, j'ai travaillé tout le week-end pour préparer mon examen de lundi.",
        "prompt": "Qu'a fait la première personne dimanche ?",
        "choices": [
            "Elle a travaillé",
            "Elle est allée à une fête",
            "Elle a fait une randonnée",
            "Elle a préparé un examen"
        ],
        "correct_index": 2,
        "explanation": "Dimanche, elle a fait une randonnée au Mont-Royal."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "Vous écoutez Radio Soleil. Il est 8 heures, voici les nouvelles. Un incendie s'est déclaré hier soir dans un entrepôt du quartier Saint-Henri à Montréal. Les pompiers ont maîtrisé le feu en deux heures. Aucune victime n'est à déplorer. L'enquête sur les causes du sinistre est en cours.",
        "prompt": "Quel est le résultat de l'incendie en termes de victimes ?",
        "choices": [
            "Deux personnes blessées",
            "Plusieurs personnes hospitalisées",
            "Aucune victime",
            "Une personne disparue"
        ],
        "correct_index": 2,
        "explanation": "Aucune victime n'est à déplorer."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "A2",
        "passage": "— Allô, bonjour. J'appelle pour le studio à louer sur la rue Laurier. Il est encore disponible ?\n— Oui, tout à fait. C'est un studio de 30 m² au troisième étage, avec balcon. Le loyer est de 850 dollars par mois, chauffage inclus.\n— Est-ce que je peux le visiter ?\n— Oui, je suis disponible mercredi à 17 heures ou samedi matin. Qu'est-ce qui vous convient ?",
        "prompt": "Qu'est-ce qui est inclus dans le loyer ?",
        "choices": ["L'électricité", "Le chauffage", "Internet", "Le stationnement"],
        "correct_index": 1,
        "explanation": "Le loyer est de 850 dollars, chauffage inclus."
    },
    # --- B1 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "Bonjour à tous, c'est votre capitaine qui vous parle. Nous traversons actuellement une zone de turbulences. Je vous demande de regagner vos places et d'attacher vos ceintures. Le service de boissons est temporairement suspendu. Nous devrions retrouver des conditions de vol normales d'ici une vingtaine de minutes. Notre atterrissage à Paris-Charles de Gaulle est toujours prévu à 7 h 45, heure locale. Merci de votre compréhension.",
        "prompt": "Pourquoi le service de boissons est-il interrompu ?",
        "choices": [
            "L'avion va bientôt atterrir",
            "Il y a des turbulences",
            "Le personnel est en pause",
            "Les réserves sont épuisées"
        ],
        "correct_index": 1,
        "explanation": "Le service est suspendu à cause des turbulences."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "— J'ai lu que la Ville de Montréal va piétonniser une partie de la rue Sainte-Catherine cet été.\n— Oui, c'est un projet pilote de juin à septembre. La circulation automobile sera interdite entre la rue Bleury et la rue Saint-Hubert. Il y aura des terrasses, des spectacles de rue et des installations artistiques.\n— Super idée ! Mais les commerçants, ils en pensent quoi ?\n— Ça dépend. Les restaurateurs sont enthousiastes, mais les boutiques craignent une baisse de fréquentation si les clients ne peuvent plus se garer à proximité.",
        "prompt": "Quelle crainte expriment certaines boutiques ?",
        "choices": [
            "Trop de bruit à cause des spectacles de rue",
            "Une baisse de fréquentation par manque de stationnement",
            "Des travaux trop longs sur la rue",
            "La concurrence des terrasses de restaurants"
        ],
        "correct_index": 1,
        "explanation": "Les boutiques craignent une baisse de fréquentation si les clients ne peuvent plus se garer."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "Reportage : La médiathèque de Gatineau a lancé un programme original de prêt d'objets. En plus des livres, les usagers peuvent emprunter une perceuse, un télescope, une machine à coudre ou même un kit de fabrication de fromage. La directrice explique : « Pourquoi acheter un objet que l'on n'utilise qu'une fois par an ? Ce service permet de réduire la consommation et de renforcer le lien communautaire. » Depuis le lancement du programme, les inscriptions à la médiathèque ont augmenté de 40 %.",
        "prompt": "Quel effet le programme a-t-il eu sur la médiathèque ?",
        "choices": [
            "Le nombre de livres empruntés a diminué",
            "Les inscriptions ont augmenté de 40 %",
            "Le budget a doublé",
            "Les horaires d'ouverture ont été réduits"
        ],
        "correct_index": 1,
        "explanation": "Les inscriptions ont augmenté de 40 % depuis le lancement du programme."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B1",
        "passage": "— Bonjour, j'ai un problème avec mon forfait téléphonique. On m'a facturé 47 dollars alors que mon forfait est à 35 dollars par mois.\n— Laissez-moi vérifier votre compte… Effectivement, je vois un dépassement de données. Vous avez utilisé 2 Go de plus que votre limite de 6 Go ce mois-ci.\n— Ah, c'est possible. J'ai beaucoup regardé des vidéos pendant mes déplacements.\n— Je peux vous proposer un forfait avec 10 Go pour 42 dollars par mois. Ça vous éviterait les frais de dépassement à l'avenir.",
        "prompt": "Pourquoi la facture est-elle plus élevée que prévu ?",
        "choices": [
            "Le forfait a augmenté de prix",
            "Il y a eu un dépassement de données",
            "Le client a fait des appels internationaux",
            "Il y a une erreur de facturation"
        ],
        "correct_index": 1,
        "explanation": "Le client a dépassé sa limite de données de 2 Go."
    },
    # --- B2 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Émission « Enjeux ». Sujet : Le vieillissement de la population au Québec. Invitée : Professeure Diane Lavoie, démographe. « Le Québec va connaître un défi démographique majeur dans les quinze prochaines années. D'ici 2040, un Québécois sur quatre aura plus de 65 ans. Cela pose la question du financement des soins de santé, de l'adaptation des logements et de l'intégration des aînés dans la vie sociale. L'immigration est souvent présentée comme une solution, mais elle ne suffit pas si les immigrants ne sont pas adéquatement intégrés sur le marché du travail. Il faut aussi repenser notre rapport à la vieillesse et valoriser l'expérience des aînés dans l'économie et la communauté. »",
        "prompt": "Selon la professeure Lavoie, pourquoi l'immigration seule ne suffit-elle pas ?",
        "choices": [
            "Les immigrants ne veulent pas travailler dans le secteur de la santé",
            "Le nombre d'immigrants est trop faible",
            "Les immigrants ne sont pas toujours intégrés sur le marché du travail",
            "L'immigration aggrave le vieillissement de la population"
        ],
        "correct_index": 2,
        "explanation": "L'immigration ne suffit pas si les immigrants ne sont pas adéquatement intégrés sur le marché du travail."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Table ronde sur l'avenir de l'agriculture au Québec. Premier intervenant, un agriculteur biologique : « Les pesticides sont en train de détruire nos sols. En vingt ans, j'ai vu la biodiversité de mes terres chuter de manière spectaculaire. Le bio est plus exigeant, oui, mais c'est le seul modèle viable à long terme. » Second intervenant, un agronome : « Je comprends cette préoccupation, mais il faut être réaliste. Le bio ne peut pas nourrir 8 milliards de personnes avec les rendements actuels. La solution, c'est l'agriculture de précision : utiliser la technologie pour réduire drastiquement les intrants chimiques sans sacrifier la productivité. »",
        "prompt": "Quelle solution propose l'agronome ?",
        "choices": [
            "Convertir toutes les exploitations au biologique",
            "Utiliser la technologie pour réduire les intrants chimiques",
            "Importer davantage de produits alimentaires",
            "Réduire la consommation mondiale de viande"
        ],
        "correct_index": 1,
        "explanation": "L'agronome propose l'agriculture de précision pour réduire les intrants chimiques."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Interview avec le directeur du Festival international de jazz de Montréal. « Cette année, nous avons pris un virage numérique important. En plus des concerts en salle, nous diffusons 30 % de notre programmation en ligne, accessible gratuitement dans le monde entier. Certains puristes regrettent que cela dénature l'expérience du festival, mais les chiffres parlent d'eux-mêmes : notre audience internationale a été multipliée par cinq. Cela crée aussi une vitrine extraordinaire pour les artistes émergents québécois, qui n'auraient jamais eu cette visibilité autrement. »",
        "prompt": "Quel avantage principal le directeur voit-il dans la diffusion en ligne ?",
        "choices": [
            "Elle réduit les coûts d'organisation du festival",
            "Elle multiplie l'audience internationale et donne de la visibilité aux artistes québécois",
            "Elle remplace avantageusement les concerts en salle",
            "Elle attire davantage de commanditaires"
        ],
        "correct_index": 1,
        "explanation": "L'audience internationale a été multipliée par cinq et cela donne de la visibilité aux artistes émergents."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "B2",
        "passage": "Chronique « Société ». On parle beaucoup de l'inflation au Canada ces derniers mois. Les prix des denrées alimentaires ont augmenté de 9 % en un an, une hausse qui frappe durement les familles à faible revenu. Les banques alimentaires rapportent une augmentation de 35 % des demandes d'aide. Le gouvernement fédéral a mis en place un supplément temporaire de 500 dollars pour les ménages les plus vulnérables, mais les organisations communautaires estiment que cette mesure est insuffisante et réclament un programme permanent d'aide alimentaire indexé au coût de la vie.",
        "prompt": "Que réclament les organisations communautaires ?",
        "choices": [
            "Une baisse des taxes sur les aliments",
            "Un programme permanent d'aide alimentaire indexé au coût de la vie",
            "La fermeture des grandes chaînes de supermarchés",
            "Un contrôle gouvernemental des prix alimentaires"
        ],
        "correct_index": 1,
        "explanation": "Les organisations réclament un programme permanent d'aide alimentaire indexé au coût de la vie."
    },
    # --- C1 (4 questions) ---
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Conférence sur l'intelligence artificielle et le marché du travail. « Il est tentant de voir l'IA comme une menace existentielle pour l'emploi, mais l'histoire nous enseigne que chaque révolution technologique a créé plus de métiers qu'elle n'en a détruits. Le véritable danger n'est pas le chômage de masse, mais la polarisation du marché du travail : les emplois hautement qualifiés et les emplois manuels non automatisables seront préservés, tandis que les emplois intermédiaires — comptabilité, traduction standardisée, analyse de données de routine — subiront une transformation radicale. L'enjeu politique central est la formation continue : comment permettre à un comptable de 50 ans de se réinventer professionnellement ? »",
        "prompt": "Selon le conférencier, quel est le véritable danger de l'IA pour l'emploi ?",
        "choices": [
            "Un chômage de masse touchant tous les secteurs",
            "La disparition totale des métiers manuels",
            "La polarisation du marché du travail avec une fragilisation des emplois intermédiaires",
            "L'impossibilité de former de nouveaux travailleurs qualifiés"
        ],
        "correct_index": 2,
        "explanation": "Le danger est la polarisation : les emplois intermédiaires seront les plus touchés."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Débat radiophonique sur la loi 96 et la protection du français au Québec. Premier intervenant : « La Charte de la langue française doit être renforcée. Le français recule dans la région de Montréal où seulement 48 % de la population l'utilise comme langue principale à la maison. Sans mesures vigoureuses, le Québec risque de devenir une province bilingue de fait, ce qui serait un recul historique. » Second intervenant : « Protéger le français, oui, mais pas au prix de la stigmatisation des communautés anglophone et allophone. L'attrait du français doit reposer sur sa vitalité culturelle et économique, pas sur la contrainte législative. Les immigrants choisissent l'anglais quand ils perçoivent qu'il offre de meilleures perspectives économiques. C'est ce déséquilibre qu'il faut corriger. »",
        "prompt": "Que propose le second intervenant pour protéger le français ?",
        "choices": [
            "Renforcer la législation linguistique existante",
            "Interdire l'usage de l'anglais dans les commerces",
            "Rendre le français plus attractif économiquement et culturellement",
            "Réduire le nombre d'immigrants anglophones"
        ],
        "correct_index": 2,
        "explanation": "Le second intervenant veut rendre le français attractif par sa vitalité culturelle et économique."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Documentaire : Les enjeux de la souveraineté alimentaire au Canada. Narratrice : « Le Canada exporte massivement des céréales et des oléagineux, mais importe 80 % de ses fruits et légumes. Cette dépendance aux chaînes d'approvisionnement internationales est apparue au grand jour pendant la pandémie, quand les étagères de certains supermarchés se sont vidées. Le concept de souveraineté alimentaire, qui consiste à prioriser la production locale pour nourrir la population, gagne du terrain. Mais les obstacles sont considérables : le climat canadien limite les cultures sur une bonne partie de l'année, et les consommateurs sont habitués à des prix bas rendus possibles par les importations massives en provenance de pays à faible coût de main-d'œuvre. »",
        "prompt": "Quel obstacle à la souveraineté alimentaire canadienne est mentionné ?",
        "choices": [
            "Le manque de terres agricoles disponibles",
            "L'opposition des agriculteurs locaux",
            "Les limitations climatiques et l'habitude des consommateurs aux prix bas",
            "L'interdiction d'importer certains produits"
        ],
        "correct_index": 2,
        "explanation": "Le climat limite les cultures et les consommateurs sont habitués aux prix bas des importations."
    },
    {
        "exam_type": "TEF", "module_id": "comprehension-orale",
        "difficulty": "C1",
        "passage": "Entretien avec une urbaniste sur le transport collectif. « Le problème fondamental des transports en commun au Canada, c'est le sous-investissement chronique. On construit des autoroutes en quelques années, mais un projet de tramway ou de métro prend des décennies entre l'annonce et la mise en service. Le REM à Montréal est un cas d'école : un réseau de train léger qui a mis dix ans à se concrétiser. Pendant ce temps, l'étalement urbain se poursuit et les gens deviennent de plus en plus dépendants de l'automobile. La solution n'est pas seulement de construire plus de transport en commun, mais de densifier les quartiers autour des stations existantes pour rentabiliser les infrastructures déjà en place. »",
        "prompt": "Selon l'urbaniste, quelle est la solution complémentaire à la construction de transports en commun ?",
        "choices": [
            "Interdire la construction de nouvelles autoroutes",
            "Subventionner l'achat de voitures électriques",
            "Densifier les quartiers autour des stations existantes",
            "Privatiser le transport en commun pour accélérer les projets"
        ],
        "correct_index": 2,
        "explanation": "Il faut densifier autour des stations existantes pour rentabiliser les infrastructures."
    },
]

# ---------------------------------------------------------------------------
# EXERCISE ITEMS — Writing (12) + Speaking (12)
# ---------------------------------------------------------------------------
EXERCISE_ITEMS = [
    # ===== TCF WRITING (6 tasks, 3 difficulty tiers) =====
    {
        "exam_type": "TCF", "skill": "writing",
        "title": "Message à un ami – Invitation",
        "prompt": "Vous venez d'emménager dans une nouvelle ville. Écrivez un message à un(e) ami(e) pour l'inviter à venir vous rendre visite. Décrivez votre nouveau logement, votre quartier et proposez des activités à faire ensemble. (80-120 mots)",
        "difficulty": "A2", "duration_minutes": 15,
        "question_type": "essay", "tier_required": "Free"
    },
    {
        "exam_type": "TCF", "skill": "writing",
        "title": "Lettre de réclamation",
        "prompt": "Vous avez commandé un appareil électroménager en ligne. À la réception, le produit est endommagé et ne correspond pas à la description. Écrivez une lettre au service client pour expliquer le problème, exprimer votre mécontentement et demander une solution. (150-200 mots)",
        "difficulty": "B1", "duration_minutes": 20,
        "question_type": "essay", "tier_required": "Free"
    },
    {
        "exam_type": "TCF", "skill": "writing",
        "title": "Article d'opinion – Réseaux sociaux et jeunesse",
        "prompt": "Rédigez un article pour un magazine en ligne sur le thème suivant : « Les réseaux sociaux sont-ils bénéfiques ou nuisibles pour les jeunes ? » Présentez les arguments des deux côtés, donnez votre opinion personnelle et proposez des solutions concrètes. (250-300 mots)",
        "difficulty": "B2", "duration_minutes": 30,
        "question_type": "essay", "tier_required": "Pro"
    },
    {
        "exam_type": "TCF", "skill": "writing",
        "title": "Courriel professionnel – Proposition de projet",
        "prompt": "Vous travaillez dans une association culturelle. Écrivez un courriel à votre directeur pour proposer l'organisation d'un festival interculturel dans votre ville. Décrivez le concept, les activités prévues, le public visé et le budget estimé. (200-250 mots)",
        "difficulty": "B2", "duration_minutes": 25,
        "question_type": "essay", "tier_required": "Pro"
    },
    {
        "exam_type": "TCF", "skill": "writing",
        "title": "Essai argumentatif – Éducation et technologie",
        "prompt": "Les écoles devraient-elles remplacer les manuels scolaires par des tablettes numériques ? Rédigez un essai structuré dans lequel vous analysez les avantages et les inconvénients de cette transition, en vous appuyant sur des exemples concrets. Présentez une conclusion nuancée. (280-350 mots)",
        "difficulty": "C1", "duration_minutes": 35,
        "question_type": "essay", "tier_required": "Max"
    },
    {
        "exam_type": "TCF", "skill": "writing",
        "title": "Synthèse et prise de position – Travail et bien-être",
        "prompt": "À partir de votre connaissance du sujet, rédigez un texte argumenté sur la question suivante : « Le bonheur au travail est-il une utopie ou un objectif réalisable ? » Vous analyserez les facteurs qui contribuent au bien-être professionnel, les obstacles rencontrés et les initiatives mises en place par certaines entreprises. (300-400 mots)",
        "difficulty": "C1", "duration_minutes": 40,
        "question_type": "essay", "tier_required": "Max"
    },
    # ===== TEF WRITING (6 tasks) =====
    {
        "exam_type": "TEF", "skill": "writing",
        "title": "Section A – Compte rendu d'un événement",
        "prompt": "Vous avez assisté à une conférence sur l'alimentation durable dans votre communauté. Rédigez un compte rendu pour le journal local. Présentez les principaux points abordés, les intervenants et les conclusions de l'événement. (200-250 mots)",
        "difficulty": "B1", "duration_minutes": 25,
        "question_type": "essay", "tier_required": "Free"
    },
    {
        "exam_type": "TEF", "skill": "writing",
        "title": "Section A – Rapport sur un sondage",
        "prompt": "Votre entreprise a mené un sondage auprès de ses employés sur la satisfaction au travail. Les résultats montrent que 70 % sont satisfaits de l'ambiance, mais 55 % trouvent leur charge de travail excessive. Rédigez un rapport présentant les résultats, analysant les points forts et les points à améliorer, et formulant des recommandations. (200-250 mots)",
        "difficulty": "B2", "duration_minutes": 25,
        "question_type": "essay", "tier_required": "Pro"
    },
    {
        "exam_type": "TEF", "skill": "writing",
        "title": "Section B – Argumentation : Immigration et intégration",
        "prompt": "Le gouvernement envisage de rendre obligatoire un cours de langue et de culture pour tous les nouveaux immigrants. Rédigez un texte argumenté dans lequel vous prenez position sur cette mesure. Présentez les arguments en faveur et contre, puis défendez votre point de vue. (300-400 mots)",
        "difficulty": "B2", "duration_minutes": 35,
        "question_type": "essay", "tier_required": "Pro"
    },
    {
        "exam_type": "TEF", "skill": "writing",
        "title": "Section B – Argumentation : Ville vs campagne",
        "prompt": "De plus en plus de citadins choisissent de s'installer en milieu rural, un phénomène accentué par le télétravail. Rédigez un essai argumenté analysant les avantages et les défis de cette tendance, tant pour les individus que pour les communautés rurales. (300-400 mots)",
        "difficulty": "B2", "duration_minutes": 35,
        "question_type": "essay", "tier_required": "Pro"
    },
    {
        "exam_type": "TEF", "skill": "writing",
        "title": "Section B – Argumentation : Gratuité des transports en commun",
        "prompt": "Certaines villes ont rendu leurs transports en commun entièrement gratuits. Analysez les conséquences économiques, sociales et environnementales de cette mesure. Prenez position en vous appuyant sur des arguments structurés. (300-400 mots)",
        "difficulty": "C1", "duration_minutes": 40,
        "question_type": "essay", "tier_required": "Max"
    },
    {
        "exam_type": "TEF", "skill": "writing",
        "title": "Section A – Lettre formelle au maire",
        "prompt": "En tant que représentant(e) d'une association de parents d'élèves, écrivez une lettre au maire de votre ville pour demander la création d'une aire de jeux sécurisée dans votre quartier. Exposez la situation actuelle, justifiez votre demande et proposez des solutions concrètes. (200-250 mots)",
        "difficulty": "B1", "duration_minutes": 25,
        "question_type": "essay", "tier_required": "Free"
    },
    # ===== TCF SPEAKING (6 tasks) =====
    {
        "exam_type": "TCF", "skill": "speaking",
        "title": "Tâche 1 – Entretien dirigé : Présentation personnelle",
        "prompt": "Présentez-vous : parlez de votre nom, votre nationalité, votre ville, votre famille, vos loisirs et votre travail ou vos études. L'examinateur vous posera des questions simples pour approfondir vos réponses. (2 minutes)",
        "difficulty": "A2", "duration_minutes": 2,
        "question_type": "oral-response", "tier_required": "Free"
    },
    {
        "exam_type": "TCF", "skill": "speaking",
        "title": "Tâche 1 – Entretien dirigé : Habitudes quotidiennes",
        "prompt": "Décrivez une journée typique dans votre vie. Parlez de vos horaires, vos repas, vos activités et ce que vous aimez ou n'aimez pas dans votre routine. L'examinateur vous posera des questions complémentaires. (2 minutes)",
        "difficulty": "A2", "duration_minutes": 2,
        "question_type": "oral-response", "tier_required": "Free"
    },
    {
        "exam_type": "TCF", "skill": "speaking",
        "title": "Tâche 2 – Interaction : Organiser un voyage",
        "prompt": "Vous voulez organiser un voyage avec un(e) ami(e) (joué par l'examinateur). Discutez de la destination, des dates, du budget, du transport et de l'hébergement. Vous devez vous mettre d'accord en négociant les préférences de chacun. (5 minutes)",
        "difficulty": "B1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Pro"
    },
    {
        "exam_type": "TCF", "skill": "speaking",
        "title": "Tâche 2 – Interaction : Résoudre un problème de voisinage",
        "prompt": "Votre voisin (joué par l'examinateur) fait régulièrement du bruit le soir. Allez lui parler pour trouver une solution. Expliquez le problème poliment, écoutez ses arguments et proposez un compromis. (5 minutes)",
        "difficulty": "B1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Pro"
    },
    {
        "exam_type": "TCF", "skill": "speaking",
        "title": "Tâche 3 – Expression d'un point de vue : Interdiction des voitures en centre-ville",
        "prompt": "Certaines villes envisagent d'interdire les voitures dans leur centre-ville. Donnez votre opinion argumentée sur ce sujet. Présentez les avantages et les inconvénients de cette mesure, illustrez vos arguments avec des exemples et proposez une conclusion. (4 minutes 30)",
        "difficulty": "B2", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Max"
    },
    {
        "exam_type": "TCF", "skill": "speaking",
        "title": "Tâche 3 – Expression d'un point de vue : L'uniforme scolaire",
        "prompt": "Pensez-vous que l'uniforme scolaire devrait être obligatoire dans les écoles françaises ? Développez votre argumentation en présentant les pour et les contre, en citant des exemples de pays où il existe, et en justifiant votre position finale. (4 minutes 30)",
        "difficulty": "B2", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Max"
    },
    # ===== TEF SPEAKING (6 tasks) =====
    {
        "exam_type": "TEF", "skill": "speaking",
        "title": "Section A – Obtenir des renseignements : Inscription à un cours",
        "prompt": "Vous téléphonez à un centre de formation pour vous inscrire à un cours de photographie. Posez des questions sur les horaires, les tarifs, le matériel nécessaire, le niveau requis et les modalités d'inscription. L'examinateur joue le rôle de l'employé. (5 minutes)",
        "difficulty": "B1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Free"
    },
    {
        "exam_type": "TEF", "skill": "speaking",
        "title": "Section A – Obtenir des renseignements : Location d'appartement",
        "prompt": "Vous appelez une agence immobilière pour vous renseigner sur un appartement à louer. Posez des questions sur la surface, le loyer, les charges, le quartier, les transports à proximité et les conditions du bail. L'examinateur joue le rôle de l'agent immobilier. (5 minutes)",
        "difficulty": "B1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Free"
    },
    {
        "exam_type": "TEF", "skill": "speaking",
        "title": "Section A – Obtenir un service : Demande de remboursement",
        "prompt": "Vous avez acheté un billet de train mais vous ne pouvez plus voyager. Vous vous rendez au guichet pour demander un remboursement ou un échange. Expliquez votre situation, répondez aux questions de l'agent et négociez la meilleure solution. (5 minutes)",
        "difficulty": "B1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Pro"
    },
    {
        "exam_type": "TEF", "skill": "speaking",
        "title": "Section B – Convaincre : Télétravail dans votre entreprise",
        "prompt": "Vous souhaitez convaincre votre directeur (joué par l'examinateur) d'instaurer le télétravail deux jours par semaine dans votre entreprise. Présentez vos arguments (productivité, bien-être, économies), répondez aux objections et proposez une période d'essai. (5 minutes)",
        "difficulty": "B2", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Pro"
    },
    {
        "exam_type": "TEF", "skill": "speaking",
        "title": "Section B – Débat : Les réseaux sociaux et la démocratie",
        "prompt": "Participez à un débat sur le thème : « Les réseaux sociaux renforcent-ils ou affaiblissent-ils la démocratie ? » Exposez votre point de vue de manière structurée, répondez aux arguments contraires de l'examinateur et défendez votre position avec des exemples concrets. (5 minutes)",
        "difficulty": "C1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Max"
    },
    {
        "exam_type": "TEF", "skill": "speaking",
        "title": "Section B – Débat : L'éducation gratuite à l'université",
        "prompt": "Débattez du sujet suivant : « L'éducation universitaire devrait-elle être entièrement gratuite ? » Analysez les implications financières, sociales et éducatives. L'examinateur défendra la position opposée à la vôtre. Restez courtois et structuré dans votre argumentation. (5 minutes)",
        "difficulty": "C1", "duration_minutes": 5,
        "question_type": "oral-response", "tier_required": "Max"
    },
]


def seed_table(client, table, rows):
    inserted = 0
    for i in range(0, len(rows), 50):
        batch = rows[i:i + 50]
        result = client.table(table).insert(batch).execute()
        inserted += len(result.data)
    return inserted


def clear_table(client, table):
    client.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()


def main():
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    print("Clearing old data...")
    clear_table(client, "questions")
    clear_table(client, "exercise_items")

    all_questions = []
    for q in TCF_READING + TEF_READING + TCF_LISTENING + TEF_LISTENING:
        all_questions.append({
            "exam_type": q["exam_type"],
            "module_id": q["module_id"],
            "prompt": q["prompt"],
            "passage": q.get("passage"),
            "audio_path": q.get("audio_path"),
            "choices": q["choices"],
            "correct_index": q["correct_index"],
            "explanation": q.get("explanation"),
            "difficulty": q.get("difficulty"),
        })

    print(f"Seeding {len(all_questions)} questions...")
    q_count = seed_table(client, "questions", all_questions)
    print(f"  Inserted {q_count} rows into questions.")

    print(f"Seeding {len(EXERCISE_ITEMS)} exercise_items...")
    e_count = seed_table(client, "exercise_items", EXERCISE_ITEMS)
    print(f"  Inserted {e_count} rows into exercise_items.")

    # Summary
    from collections import Counter
    q_summary = Counter((q["exam_type"], q["module_id"]) for q in all_questions)
    e_summary = Counter((e["exam_type"], e["skill"]) for e in EXERCISE_ITEMS)
    print("\n--- Question breakdown ---")
    for (exam, mod), count in sorted(q_summary.items()):
        print(f"  {exam} {mod}: {count}")
    print("\n--- Exercise breakdown ---")
    for (exam, skill), count in sorted(e_summary.items()):
        print(f"  {exam} {skill}: {count}")
    print("\nSeed complete.")


if __name__ == "__main__":
    main()
