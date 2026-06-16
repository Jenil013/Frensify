-- System vocabulary decks for TEF/TCF exam prep (user_id IS NULL)
-- Run after migrations. Safe to re-run: skips if cards already exist.

INSERT INTO public.vocabulary_cards (word, translation, category, difficulty, example_sentence, exam_type)
SELECT v.word, v.translation, v.category, v.difficulty, v.example_sentence, v.exam_type
FROM (VALUES
  -- Argument connectors
  ('Néanmoins', 'Nevertheless / nonetheless', 'Argument connectors', 'B2', 'Le projet est coûteux ; néanmoins, il reste nécessaire.', 'both'),
  ('En revanche', 'On the other hand / conversely', 'Argument connectors', 'B2', 'En revanche, certains estiment que cette mesure est excessive.', 'both'),
  ('D''une part… d''autre part', 'On one hand… on the other hand', 'Argument connectors', 'B2', 'D''une part, le télétravail offre de la flexibilité ; d''autre part, il isole les employés.', 'both'),
  ('Il convient de', 'It is appropriate to', 'Argument connectors', 'B2', 'Il convient de respecter les délais fixés par l''administration.', 'both'),
  ('Force est de constater que', 'One must acknowledge that', 'Argument connectors', 'C1', 'Force est de constater que les résultats restent mitigés.', 'both'),
  ('À mon avis', 'In my opinion', 'Argument connectors', 'B1', 'À mon avis, cette solution répond aux besoins des familles.', 'both'),
  ('Pour ma part', 'For my part / as for me', 'Argument connectors', 'B2', 'Pour ma part, je préfère une approche progressive.', 'both'),
  ('En effet', 'Indeed / in fact', 'Argument connectors', 'B1', 'En effet, la demande a fortement augmenté cette année.', 'both'),
  ('Cependant', 'However', 'Argument connectors', 'B1', 'Cependant, plusieurs obstacles subsistent.', 'both'),
  ('Par ailleurs', 'Furthermore / moreover', 'Argument connectors', 'B2', 'Par ailleurs, le coût de la vie continue d''augmenter.', 'both'),
  -- Cause / consequence
  ('Par conséquent', 'Consequently / therefore', 'Cause / consequence', 'B2', 'Par conséquent, nous devons revoir notre stratégie.', 'both'),
  ('Étant donné que', 'Given that / since', 'Cause / consequence', 'B2', 'Étant donné que les délais sont courts, accélérons le processus.', 'both'),
  ('D''autant plus que', 'All the more so as', 'Cause / consequence', 'B2', 'C''est urgent, d''autant plus que les places sont limitées.', 'both'),
  ('En raison de', 'Because of / due to', 'Cause / consequence', 'B1', 'En raison de la météo, le vol a été retardé.', 'both'),
  ('Grâce à', 'Thanks to', 'Cause / consequence', 'A2', 'Grâce à votre aide, j''ai pu terminer à temps.', 'both'),
  ('Ainsi', 'Thus / therefore', 'Cause / consequence', 'B1', 'Ainsi, nous pouvons conclure que le plan est viable.', 'both'),
  ('C''est pourquoi', 'That is why', 'Cause / consequence', 'B1', 'C''est pourquoi je vous propose une alternative.', 'both'),
  ('Du fait que', 'Due to the fact that', 'Cause / consequence', 'B2', 'Du fait que les ressources sont limitées, priorisons l''essentiel.', 'both'),
  ('Entraîner', 'To lead to / cause', 'Cause / consequence', 'B2', 'Cette politique pourrait entraîner des tensions sociales.', 'both'),
  ('Provoquer', 'To provoke / cause', 'Cause / consequence', 'B2', 'Le discours a provoqué un vif débat.', 'both'),
  -- Oral — obtain information
  ('Pourriez-vous me préciser', 'Could you clarify for me', 'Oral — obtain information', 'B2', 'Pourriez-vous me préciser les documents requis ?', 'both'),
  ('Auriez-vous l''amabilité de', 'Would you be so kind as to', 'Oral — obtain information', 'B2', 'Auriez-vous l''amabilité de m''indiquer la procédure ?', 'both'),
  ('Je souhaiterais savoir si', 'I would like to know if', 'Oral — obtain information', 'B1', 'Je souhaiterais savoir si les cours sont disponibles en ligne.', 'both'),
  ('Pourriez-vous m''expliquer', 'Could you explain to me', 'Oral — obtain information', 'B1', 'Pourriez-vous m''expliquer les étapes suivantes ?', 'both'),
  ('Serait-il possible de', 'Would it be possible to', 'Oral — obtain information', 'B2', 'Serait-il possible de reporter le rendez-vous ?', 'both'),
  ('J''aimerais obtenir des renseignements sur', 'I would like to get information about', 'Oral — obtain information', 'B2', 'J''aimerais obtenir des renseignements sur les frais de scolarité.', 'TCF'),
  ('Pourriez-vous me dire combien', 'Could you tell me how much', 'Oral — obtain information', 'B1', 'Pourriez-vous me dire combien coûte l''abonnement ?', 'both'),
  ('Est-ce que vous pourriez me renseigner sur', 'Could you inform me about', 'Oral — obtain information', 'B2', 'Est-ce que vous pourriez me renseigner sur les horaires ?', 'TEF'),
  ('Je voudrais connaître les conditions pour', 'I would like to know the conditions for', 'Oral — obtain information', 'B2', 'Je voudrais connaître les conditions pour obtenir le visa.', 'TEF'),
  ('Auriez-vous des informations concernant', 'Would you have information regarding', 'Oral — obtain information', 'B2', 'Auriez-vous des informations concernant le logement étudiant ?', 'both'),
  -- Oral — convince / argue
  ('Je suis convaincu(e) que', 'I am convinced that', 'Oral — convince / argue', 'B2', 'Je suis convaincu que cette formation ouvre de nombreuses portes.', 'both'),
  ('Il me semble que', 'It seems to me that', 'Oral — convince / argue', 'B1', 'Il me semble que cette option est la plus raisonnable.', 'both'),
  ('Je considère que', 'I consider that', 'Oral — convince / argue', 'B2', 'Je considère que l''éducation doit rester accessible.', 'both'),
  ('Selon moi', 'According to me / in my view', 'Oral — convince / argue', 'B1', 'Selon moi, le télétravail améliore l''équilibre vie pro-vie perso.', 'both'),
  ('Je maintiens que', 'I maintain that', 'Oral — convince / argue', 'C1', 'Je maintiens que la prévention est plus efficace que la répression.', 'both'),
  ('Il est indéniable que', 'It is undeniable that', 'Oral — convince / argue', 'C1', 'Il est indéniable que le climat évolue rapidement.', 'both'),
  ('Je plaide en faveur de', 'I argue in favour of', 'Oral — convince / argue', 'C1', 'Je plaide en faveur d''une réforme progressive.', 'both'),
  ('À condition que', 'Provided that / on condition that', 'Oral — convince / argue', 'B2', 'J''accepte, à condition que les délais soient respectés.', 'both'),
  ('Bien que', 'Although', 'Oral — convince / argue', 'B2', 'Bien que coûteux, ce projet reste prioritaire.', 'both'),
  ('Tout en reconnaissant que', 'While acknowledging that', 'Oral — convince / argue', 'C1', 'Tout en reconnaissant que des progrès ont été faits, des lacunes persistent.', 'both'),
  -- Immigration & work
  ('Un atout majeur', 'A major asset / advantage', 'Immigration & work', 'B2', 'La maîtrise du français est un atout majeur sur le marché du travail.', 'TEF'),
  ('S''intégrer', 'To integrate / settle in', 'Immigration & work', 'B2', 'Il faut du temps pour s''intégrer dans une nouvelle société.', 'TEF'),
  ('Le permis de travail', 'Work permit', 'Immigration & work', 'B1', 'J''ai déposé ma demande de permis de travail.', 'TEF'),
  ('La résidence permanente', 'Permanent residence', 'Immigration & work', 'B2', 'La résidence permanente offre plus de stabilité.', 'TEF'),
  ('S''adapter à', 'To adapt to', 'Immigration & work', 'B1', 'Il est essentiel de s''adapter aux normes locales.', 'TEF'),
  ('L''équivalence des diplômes', 'Credential recognition / equivalency', 'Immigration & work', 'B2', 'L''équivalence des diplômes peut prendre plusieurs mois.', 'TEF'),
  ('Le marché de l''emploi', 'The job market', 'Immigration & work', 'B1', 'Le marché de l''emploi est compétitif dans cette région.', 'both'),
  ('Une expérience professionnelle', 'Professional experience', 'Immigration & work', 'B1', 'J''ai cinq ans d''expérience professionnelle dans le secteur public.', 'both'),
  ('Un employeur', 'An employer', 'Immigration & work', 'A2', 'Mon employeur m''a proposé une promotion.', 'both'),
  ('La mobilité professionnelle', 'Professional mobility', 'Immigration & work', 'B2', 'La mobilité professionnelle favorise l''évolution de carrière.', 'both'),
  -- Formal register
  ('Dorénavant', 'From now on / henceforth', 'Formal register', 'B2', 'Dorénavant, les réunions auront lieu le mardi.', 'both'),
  ('Primordial', 'Crucial / of paramount importance', 'Formal register', 'B2', 'Il est primordial de respecter les délais.', 'both'),
  ('Susciter', 'To provoke / trigger / generate', 'Formal register', 'C1', 'Cette annonce a suscité de vives réactions.', 'both'),
  ('Inéluctable', 'Unavoidable / inevitable', 'Formal register', 'C1', 'Le changement climatique est une réalité inéluctable.', 'both'),
  ('S''avérer', 'To turn out / prove to be', 'Formal register', 'C1', 'La solution s''est avérée plus complexe que prévu.', 'both'),
  ('Accroître', 'To increase / expand', 'Formal register', 'B1', 'Nous devons accroître nos efforts de formation.', 'both'),
  ('Se conformer à', 'To comply with', 'Formal register', 'B2', 'Les entreprises doivent se conformer à la réglementation.', 'both'),
  ('Il est impératif de', 'It is imperative to', 'Formal register', 'B2', 'Il est impératif de réduire les délais de traitement.', 'both'),
  ('En outre', 'Moreover / furthermore', 'Formal register', 'B2', 'En outre, le budget prévoit des investissements supplémentaires.', 'both'),
  ('Il apparaît que', 'It appears that', 'Formal register', 'B2', 'Il apparaît que la situation s''améliore progressivement.', 'both')
) AS v(word, translation, category, difficulty, example_sentence, exam_type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.vocabulary_cards WHERE user_id IS NULL LIMIT 1
);
