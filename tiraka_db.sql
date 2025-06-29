PGDMP  )            	        }           railway    16.8 (Debian 16.8-1.pgdg120+1)    17.4 \    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16384    railway    DATABASE     r   CREATE DATABASE railway WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE railway;
                     postgres    false            �            1259    16389    attendance_record    TABLE     �   CREATE TABLE public.attendance_record (
    id integer NOT NULL,
    fencer_id integer NOT NULL,
    date date NOT NULL,
    check_in time without time zone,
    check_out time without time zone
);
 %   DROP TABLE public.attendance_record;
       public         heap r       postgres    false            �            1259    16392    attendance_record_id_seq    SEQUENCE     �   CREATE SEQUENCE public.attendance_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.attendance_record_id_seq;
       public               postgres    false    215            �           0    0    attendance_record_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.attendance_record_id_seq OWNED BY public.attendance_record.id;
          public               postgres    false    216            �            1259    16393    class_diary    TABLE     �   CREATE TABLE public.class_diary (
    id bigint NOT NULL,
    fencer_id bigint NOT NULL,
    title text NOT NULL,
    date date NOT NULL,
    description text NOT NULL
);
    DROP TABLE public.class_diary;
       public         heap r       postgres    false            �            1259    16398    class_diary_id_seq    SEQUENCE     {   CREATE SEQUENCE public.class_diary_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.class_diary_id_seq;
       public               postgres    false    217            �           0    0    class_diary_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.class_diary_id_seq OWNED BY public.class_diary.id;
          public               postgres    false    218            �            1259    16399    coach    TABLE     �   CREATE TABLE public.coach (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    surname text NOT NULL,
    secondsurname text,
    clubname text NOT NULL,
    email character varying(255)
);
    DROP TABLE public.coach;
       public         heap r       postgres    false            �            1259    16404    coach_id_seq    SEQUENCE     �   CREATE SEQUENCE public.coach_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.coach_id_seq;
       public               postgres    false    219            �           0    0    coach_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.coach_id_seq OWNED BY public.coach.id;
          public               postgres    false    220            �            1259    16518    coach_training_templates    TABLE     �   CREATE TABLE public.coach_training_templates (
    id integer NOT NULL,
    coach_id integer,
    title text NOT NULL,
    description text,
    number_of_sets integer,
    number_of_reps integer,
    duration integer
);
 ,   DROP TABLE public.coach_training_templates;
       public         heap r       postgres    false            �            1259    16405    competition_diary    TABLE     \  CREATE TABLE public.competition_diary (
    id integer NOT NULL,
    title text,
    competition_date date NOT NULL,
    location text,
    final_position integer,
    wins_pool integer,
    losses_pool integer,
    passed_pool boolean,
    feedback text,
    created_at timestamp without time zone DEFAULT now(),
    fencer_id integer NOT NULL
);
 %   DROP TABLE public.competition_diary;
       public         heap r       postgres    false            �            1259    16411    competition_diary_de    TABLE     �   CREATE TABLE public.competition_diary_de (
    id integer NOT NULL,
    competition_entry_id integer,
    stage integer,
    description text,
    fencer_id integer NOT NULL
);
 (   DROP TABLE public.competition_diary_de;
       public         heap r       postgres    false            �            1259    16416    competition_diary_de_id_seq    SEQUENCE     �   CREATE SEQUENCE public.competition_diary_de_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.competition_diary_de_id_seq;
       public               postgres    false    222            �           0    0    competition_diary_de_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.competition_diary_de_id_seq OWNED BY public.competition_diary_de.id;
          public               postgres    false    223            �            1259    16417    competition_diary_id_seq    SEQUENCE     �   CREATE SEQUENCE public.competition_diary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.competition_diary_id_seq;
       public               postgres    false    221            �           0    0    competition_diary_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.competition_diary_id_seq OWNED BY public.competition_diary.id;
          public               postgres    false    224            �            1259    16418    fencer    TABLE       CREATE TABLE public.fencer (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    surname text NOT NULL,
    secondsurname text,
    clubname text,
    birthdate date NOT NULL,
    email character varying(255)
);
    DROP TABLE public.fencer;
       public         heap r       postgres    false            �            1259    16423    fencer_coach    TABLE     �   CREATE TABLE public.fencer_coach (
    fencer_id bigint NOT NULL,
    coach_id bigint NOT NULL,
    relation_id integer NOT NULL
);
     DROP TABLE public.fencer_coach;
       public         heap r       postgres    false            �            1259    16426    fencer_coach_relation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.fencer_coach_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.fencer_coach_relation_id_seq;
       public               postgres    false    226            �           0    0    fencer_coach_relation_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.fencer_coach_relation_id_seq OWNED BY public.fencer_coach.relation_id;
          public               postgres    false    227            �            1259    16427    fencer_coach_sessions    TABLE     w  CREATE TABLE public.fencer_coach_sessions (
    id bigint NOT NULL,
    fencer_id bigint NOT NULL,
    coach_id bigint NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    duration integer,
    feedback text,
    number_of_sets bigint NOT NULL,
    number_of_reps bigint NOT NULL,
    is_completed boolean NOT NULL,
    title text,
    template_id integer
);
 )   DROP TABLE public.fencer_coach_sessions;
       public         heap r       postgres    false            �            1259    16432    fencer_coach_sessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.fencer_coach_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.fencer_coach_sessions_id_seq;
       public               postgres    false    228            �           0    0    fencer_coach_sessions_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.fencer_coach_sessions_id_seq OWNED BY public.fencer_coach_sessions.id;
          public               postgres    false    229            �            1259    16433    fencer_id_seq    SEQUENCE     �   CREATE SEQUENCE public.fencer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.fencer_id_seq;
       public               postgres    false    225            �           0    0    fencer_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.fencer_id_seq OWNED BY public.fencer.id;
          public               postgres    false    230            �            1259    16434    fencer_personal_sessions    TABLE     m  CREATE TABLE public.fencer_personal_sessions (
    id bigint NOT NULL,
    fencer_id bigint NOT NULL,
    title text NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    duration bigint NOT NULL,
    feedback text,
    number_of_sets bigint NOT NULL,
    number_of_reps bigint NOT NULL,
    is_completed boolean NOT NULL,
    template_id integer
);
 ,   DROP TABLE public.fencer_personal_sessions;
       public         heap r       postgres    false            �            1259    16439    fencer_personal_sessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.fencer_personal_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.fencer_personal_sessions_id_seq;
       public               postgres    false    231            �           0    0    fencer_personal_sessions_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.fencer_personal_sessions_id_seq OWNED BY public.fencer_personal_sessions.id;
          public               postgres    false    232            �            1259    16547    fencer_training_templates    TABLE     �   CREATE TABLE public.fencer_training_templates (
    id integer NOT NULL,
    fencer_id integer NOT NULL,
    title text,
    description text,
    duration integer,
    number_of_sets integer,
    number_of_reps integer
);
 -   DROP TABLE public.fencer_training_templates;
       public         heap r       postgres    false            �            1259    16546     fencer_training_templates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.fencer_training_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.fencer_training_templates_id_seq;
       public               postgres    false    236            �           0    0     fencer_training_templates_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.fencer_training_templates_id_seq OWNED BY public.fencer_training_templates.id;
          public               postgres    false    235            �            1259    16517    training_templates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.training_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.training_templates_id_seq;
       public               postgres    false    234            �           0    0    training_templates_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.training_templates_id_seq OWNED BY public.coach_training_templates.id;
          public               postgres    false    233            �           2604    16440    attendance_record id    DEFAULT     |   ALTER TABLE ONLY public.attendance_record ALTER COLUMN id SET DEFAULT nextval('public.attendance_record_id_seq'::regclass);
 C   ALTER TABLE public.attendance_record ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    216    215            �           2604    16441    class_diary id    DEFAULT     p   ALTER TABLE ONLY public.class_diary ALTER COLUMN id SET DEFAULT nextval('public.class_diary_id_seq'::regclass);
 =   ALTER TABLE public.class_diary ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217            �           2604    16442    coach id    DEFAULT     d   ALTER TABLE ONLY public.coach ALTER COLUMN id SET DEFAULT nextval('public.coach_id_seq'::regclass);
 7   ALTER TABLE public.coach ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219            �           2604    16521    coach_training_templates id    DEFAULT     �   ALTER TABLE ONLY public.coach_training_templates ALTER COLUMN id SET DEFAULT nextval('public.training_templates_id_seq'::regclass);
 J   ALTER TABLE public.coach_training_templates ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    234    233    234            �           2604    16443    competition_diary id    DEFAULT     |   ALTER TABLE ONLY public.competition_diary ALTER COLUMN id SET DEFAULT nextval('public.competition_diary_id_seq'::regclass);
 C   ALTER TABLE public.competition_diary ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    221            �           2604    16444    competition_diary_de id    DEFAULT     �   ALTER TABLE ONLY public.competition_diary_de ALTER COLUMN id SET DEFAULT nextval('public.competition_diary_de_id_seq'::regclass);
 F   ALTER TABLE public.competition_diary_de ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222            �           2604    16445 	   fencer id    DEFAULT     f   ALTER TABLE ONLY public.fencer ALTER COLUMN id SET DEFAULT nextval('public.fencer_id_seq'::regclass);
 8   ALTER TABLE public.fencer ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    225            �           2604    16446    fencer_coach relation_id    DEFAULT     �   ALTER TABLE ONLY public.fencer_coach ALTER COLUMN relation_id SET DEFAULT nextval('public.fencer_coach_relation_id_seq'::regclass);
 G   ALTER TABLE public.fencer_coach ALTER COLUMN relation_id DROP DEFAULT;
       public               postgres    false    227    226            �           2604    16447    fencer_coach_sessions id    DEFAULT     �   ALTER TABLE ONLY public.fencer_coach_sessions ALTER COLUMN id SET DEFAULT nextval('public.fencer_coach_sessions_id_seq'::regclass);
 G   ALTER TABLE public.fencer_coach_sessions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    228            �           2604    16448    fencer_personal_sessions id    DEFAULT     �   ALTER TABLE ONLY public.fencer_personal_sessions ALTER COLUMN id SET DEFAULT nextval('public.fencer_personal_sessions_id_seq'::regclass);
 J   ALTER TABLE public.fencer_personal_sessions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231            �           2604    16550    fencer_training_templates id    DEFAULT     �   ALTER TABLE ONLY public.fencer_training_templates ALTER COLUMN id SET DEFAULT nextval('public.fencer_training_templates_id_seq'::regclass);
 K   ALTER TABLE public.fencer_training_templates ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    236    235    236            q          0    16389    attendance_record 
   TABLE DATA           U   COPY public.attendance_record (id, fencer_id, date, check_in, check_out) FROM stdin;
    public               postgres    false    215   �w       s          0    16393    class_diary 
   TABLE DATA           N   COPY public.class_diary (id, fencer_id, title, date, description) FROM stdin;
    public               postgres    false    217   y       u          0    16399    coach 
   TABLE DATA           f   COPY public.coach (id, username, password, name, surname, secondsurname, clubname, email) FROM stdin;
    public               postgres    false    219   C|       �          0    16518    coach_training_templates 
   TABLE DATA           ~   COPY public.coach_training_templates (id, coach_id, title, description, number_of_sets, number_of_reps, duration) FROM stdin;
    public               postgres    false    234   �}       w          0    16405    competition_diary 
   TABLE DATA           �   COPY public.competition_diary (id, title, competition_date, location, final_position, wins_pool, losses_pool, passed_pool, feedback, created_at, fencer_id) FROM stdin;
    public               postgres    false    221   �}       x          0    16411    competition_diary_de 
   TABLE DATA           g   COPY public.competition_diary_de (id, competition_entry_id, stage, description, fencer_id) FROM stdin;
    public               postgres    false    222   �       {          0    16418    fencer 
   TABLE DATA           r   COPY public.fencer (id, username, password, name, surname, secondsurname, clubname, birthdate, email) FROM stdin;
    public               postgres    false    225   �       |          0    16423    fencer_coach 
   TABLE DATA           H   COPY public.fencer_coach (fencer_id, coach_id, relation_id) FROM stdin;
    public               postgres    false    226   l�       ~          0    16427    fencer_coach_sessions 
   TABLE DATA           �   COPY public.fencer_coach_sessions (id, fencer_id, coach_id, date, description, duration, feedback, number_of_sets, number_of_reps, is_completed, title, template_id) FROM stdin;
    public               postgres    false    228   ��       �          0    16434    fencer_personal_sessions 
   TABLE DATA           �   COPY public.fencer_personal_sessions (id, fencer_id, title, date, description, duration, feedback, number_of_sets, number_of_reps, is_completed, template_id) FROM stdin;
    public               postgres    false    231   ��       �          0    16547    fencer_training_templates 
   TABLE DATA           �   COPY public.fencer_training_templates (id, fencer_id, title, description, duration, number_of_sets, number_of_reps) FROM stdin;
    public               postgres    false    236   ؁       �           0    0    attendance_record_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.attendance_record_id_seq', 34, true);
          public               postgres    false    216            �           0    0    class_diary_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.class_diary_id_seq', 18, true);
          public               postgres    false    218            �           0    0    coach_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.coach_id_seq', 11, true);
          public               postgres    false    220            �           0    0    competition_diary_de_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.competition_diary_de_id_seq', 18, true);
          public               postgres    false    223            �           0    0    competition_diary_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.competition_diary_id_seq', 8, true);
          public               postgres    false    224            �           0    0    fencer_coach_relation_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.fencer_coach_relation_id_seq', 15, true);
          public               postgres    false    227            �           0    0    fencer_coach_sessions_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.fencer_coach_sessions_id_seq', 54, true);
          public               postgres    false    229            �           0    0    fencer_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.fencer_id_seq', 12, true);
          public               postgres    false    230            �           0    0    fencer_personal_sessions_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.fencer_personal_sessions_id_seq', 123, true);
          public               postgres    false    232            �           0    0     fencer_training_templates_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.fencer_training_templates_id_seq', 35, true);
          public               postgres    false    235            �           0    0    training_templates_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.training_templates_id_seq', 9, true);
          public               postgres    false    233            �           2606    16450 (   attendance_record attendance_record_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.attendance_record
    ADD CONSTRAINT attendance_record_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.attendance_record DROP CONSTRAINT attendance_record_pkey;
       public                 postgres    false    215            �           2606    16452    class_diary class_diary_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.class_diary
    ADD CONSTRAINT class_diary_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.class_diary DROP CONSTRAINT class_diary_pkey;
       public                 postgres    false    217            �           2606    16454    coach coach_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.coach
    ADD CONSTRAINT coach_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.coach DROP CONSTRAINT coach_pkey;
       public                 postgres    false    219            �           2606    16456 .   competition_diary_de competition_diary_de_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.competition_diary_de
    ADD CONSTRAINT competition_diary_de_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.competition_diary_de DROP CONSTRAINT competition_diary_de_pkey;
       public                 postgres    false    222            �           2606    16458 (   competition_diary competition_diary_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.competition_diary
    ADD CONSTRAINT competition_diary_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.competition_diary DROP CONSTRAINT competition_diary_pkey;
       public                 postgres    false    221            �           2606    16460    fencer_coach fencer_coach_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.fencer_coach
    ADD CONSTRAINT fencer_coach_pkey PRIMARY KEY (relation_id);
 H   ALTER TABLE ONLY public.fencer_coach DROP CONSTRAINT fencer_coach_pkey;
       public                 postgres    false    226            �           2606    16462 1   fencer_coach_sessions fencer_coach_sessions_id_pk 
   CONSTRAINT     o   ALTER TABLE ONLY public.fencer_coach_sessions
    ADD CONSTRAINT fencer_coach_sessions_id_pk PRIMARY KEY (id);
 [   ALTER TABLE ONLY public.fencer_coach_sessions DROP CONSTRAINT fencer_coach_sessions_id_pk;
       public                 postgres    false    228            �           2606    16464 6   fencer_personal_sessions fencer_personal_sessions_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.fencer_personal_sessions
    ADD CONSTRAINT fencer_personal_sessions_pkey PRIMARY KEY (id);
 `   ALTER TABLE ONLY public.fencer_personal_sessions DROP CONSTRAINT fencer_personal_sessions_pkey;
       public                 postgres    false    231            �           2606    16466    fencer fencer_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.fencer
    ADD CONSTRAINT fencer_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.fencer DROP CONSTRAINT fencer_pkey;
       public                 postgres    false    225            �           2606    16554 8   fencer_training_templates fencer_training_templates_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.fencer_training_templates
    ADD CONSTRAINT fencer_training_templates_pkey PRIMARY KEY (id);
 b   ALTER TABLE ONLY public.fencer_training_templates DROP CONSTRAINT fencer_training_templates_pkey;
       public                 postgres    false    236            �           2606    16525 0   coach_training_templates training_templates_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.coach_training_templates
    ADD CONSTRAINT training_templates_pkey PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public.coach_training_templates DROP CONSTRAINT training_templates_pkey;
       public                 postgres    false    234            �           2606    16467 7   fencer_personal_sessions FK_fencer_id_personal_sessions    FK CONSTRAINT     �   ALTER TABLE ONLY public.fencer_personal_sessions
    ADD CONSTRAINT "FK_fencer_id_personal_sessions" FOREIGN KEY (fencer_id) REFERENCES public.fencer(id) ON UPDATE CASCADE ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.fencer_personal_sessions DROP CONSTRAINT "FK_fencer_id_personal_sessions";
       public               postgres    false    3276    225    231            �           2606    16472 2   attendance_record attendance_record_fencer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.attendance_record
    ADD CONSTRAINT attendance_record_fencer_id_fkey FOREIGN KEY (fencer_id) REFERENCES public.fencer(id);
 \   ALTER TABLE ONLY public.attendance_record DROP CONSTRAINT attendance_record_fencer_id_fkey;
       public               postgres    false    225    215    3276            �           2606    16477    fencer_coach coach_relation    FK CONSTRAINT     �   ALTER TABLE ONLY public.fencer_coach
    ADD CONSTRAINT coach_relation FOREIGN KEY (coach_id) REFERENCES public.coach(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.fencer_coach DROP CONSTRAINT coach_relation;
       public               postgres    false    219    3270    226            �           2606    16482 C   competition_diary_de competition_diary_de_competition_entry_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.competition_diary_de
    ADD CONSTRAINT competition_diary_de_competition_entry_id_fkey FOREIGN KEY (competition_entry_id) REFERENCES public.competition_diary(id) ON DELETE CASCADE;
 m   ALTER TABLE ONLY public.competition_diary_de DROP CONSTRAINT competition_diary_de_competition_entry_id_fkey;
       public               postgres    false    3272    222    221            �           2606    16487 8   competition_diary_de competition_diary_de_fencer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.competition_diary_de
    ADD CONSTRAINT competition_diary_de_fencer_id_fkey FOREIGN KEY (fencer_id) REFERENCES public.fencer(id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.competition_diary_de DROP CONSTRAINT competition_diary_de_fencer_id_fkey;
       public               postgres    false    222    3276    225            �           2606    16492 2   competition_diary competition_diary_fencer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.competition_diary
    ADD CONSTRAINT competition_diary_fencer_id_fkey FOREIGN KEY (fencer_id) REFERENCES public.fencer(id) ON DELETE CASCADE;
 \   ALTER TABLE ONLY public.competition_diary DROP CONSTRAINT competition_diary_fencer_id_fkey;
       public               postgres    false    3276    221    225            �           2606    16497    fencer_coach fencer_relation    FK CONSTRAINT     �   ALTER TABLE ONLY public.fencer_coach
    ADD CONSTRAINT fencer_relation FOREIGN KEY (fencer_id) REFERENCES public.fencer(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.fencer_coach DROP CONSTRAINT fencer_relation;
       public               postgres    false    3276    226    225            �           2606    16502 !   class_diary fk_class_diary_fencer    FK CONSTRAINT     �   ALTER TABLE ONLY public.class_diary
    ADD CONSTRAINT fk_class_diary_fencer FOREIGN KEY (fencer_id) REFERENCES public.fencer(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.class_diary DROP CONSTRAINT fk_class_diary_fencer;
       public               postgres    false    225    217    3276            �           2606    16507 *   fencer_coach_sessions fk_workouts_coach_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.fencer_coach_sessions
    ADD CONSTRAINT fk_workouts_coach_id FOREIGN KEY (coach_id) REFERENCES public.coach(id) ON UPDATE CASCADE ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.fencer_coach_sessions DROP CONSTRAINT fk_workouts_coach_id;
       public               postgres    false    228    3270    219            �           2606    16512 +   fencer_coach_sessions fk_workouts_fencer_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.fencer_coach_sessions
    ADD CONSTRAINT fk_workouts_fencer_id FOREIGN KEY (fencer_id) REFERENCES public.fencer(id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.fencer_coach_sessions DROP CONSTRAINT fk_workouts_fencer_id;
       public               postgres    false    228    225    3276            �           2606    16526 9   coach_training_templates training_templates_coach_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.coach_training_templates
    ADD CONSTRAINT training_templates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coach(id);
 c   ALTER TABLE ONLY public.coach_training_templates DROP CONSTRAINT training_templates_coach_id_fkey;
       public               postgres    false    234    219    3270            q     x�u�mn� ��p�N�����1d3�&�*J��%����Ȑ`^��W}������Y��f�!�)(���B5��"�@�����f�j���E+��t���xu�&-D/>��Y�Mv���PD�w�������:�C�#��A9T���a\��)�1.�P�G��ާO�!d	4_S�C��˼�!�C�q�y�N{~�}ט�.qd�s�"�%��Ǵ��i{ř��c}
�������GS��й=нK�B,Y�Yc��^C���W��-��a      s     x�mT�n1>'O1܊�F����AH !���x'��׳���mz,�7`_�o�I[A�(��x~�������_q+��L��韟�t��+Z{'kI�'GG'�'�G�w|Eߋ�%;IA�i���K��瞣�GYI(0%�}�A	��F4BV��(I�[����E���3������<��y}<����h�A���RQ�"=��K�Ǟiw�y���?�%%NY�Y`h}n���+���/���5���Nǉ+g����,�u�������h�ux�����$Y�&�A���O��'М�2��m������H��m'3c��?�F���F�M!�����D�	��������˼}��y^�Q|� vk�S\�!p�2�wbzx���8��> �#�{Yy&�698�������y
WR�tcF��7ge���g�q�d,|��,��Ճ� #!�ܘ#�Amu�ư��1��K�18�W�I��'A�����.z��@5W��4!��W�A1��`Ylf�K�.i��Z��ƿ�E��H��*�)�MM�!${$?��@Z5=���t��#�s�4��݃9s�fð(�I�"ά��� ��x���s굵��1�� T�
J�*rn�u�V�RkՏ�m������p���A�͔�Ô#n����K���#�a��K��2�����R�!�y*���h\��B�~������;��\Ɏ#�қ�r1���|N�"PA����Q��3�n����y�&U	zy�O�џ����WDzPj6�hUk�9��h�/$ֵ�hϦ��t��0Q      u   5  x�M�]r�0���:|�$�o�2�2*+m���P	Fmv��
7Vt��ӽsϝs�-@�NRN�\HE�@%hu���TnQVJlU�GV�<<2f��z�����4�j�`�Ǔ��,�	�c0�� #*���	� �%�i+ᆰ��yi��2 ��=�4G�,$����Hg8�K[�ԏ>�p��U0�f��f��Өa�0���x�A��n[�BȌV-��d�����CXU����.�i�$��S�3<L���<yR���"M�u�P�k�A��9� D�3u�|>���,�V����H�@�e����3      �      x������ � �      w   �  x�e�MnA���S�<���N��,�"YfS�؍z����0�,Yd�8��$'��X!V��z�ի�V�o?о���߿���U]�m���n�W�SPꅒo�ac�_���Qc�m�M�V���N|D�z�4�3�x�4r`rLc���jt%ً���=��v��xcG���&�I|�'q��j��rB'!����"֛Bϡ(�a�m�p�#Ⱥ�q�!���pVB�K�0�*Q�JoZ��V<���ԮW��d��!v�:�y����C'ҧ,�)��Lϥ�Bŉ��\����gR��n����dE{�R�) i�椗��0���/�0  h,���Z:=���W<3�^���6.�ab���� ���	^��B��]��{���2^�1L;bB�0J!�[t�ק���\��]0v�羌�^<L�X
vĞ8��9�b	�7yؖ1����;&�nPq�ږ�A¼B�V�Fo�f[w�����mW���]�����j�X��!      x   K   x�34�4�44��t�H�+ITx4��Ӝ��(jf�ih���`h5�AE�a�� �8-A��
��� c���� ���      {   W  x�U��n�@����J�V�4�H����DawAS���S�b�Z��i��˯(�H��9��>����-En��E�L��^EXW�	W�S�Z��;��9�e0]Xd]o�8�k�r�l`E�E�3R�I�+4��0*���� G�,�mEm��8�$��	�MW�M��/���Iu�s��4�kX_yK<;�������W�\{SL��eo�,>N�M&������HK_��y̒ĜV%N�E�k�z[��'�I�5rl�)d���"ݧ��XΩ�Z1u��Y���h����zcw{+���m�f��m�lʀ@�~L�,`	/�fK$up���A�D�      |   "   x�34�44�44�24��44�2Q�\1z\\\ >c�      ~      x������ � �      �      x������ � �      �      x������ � �     