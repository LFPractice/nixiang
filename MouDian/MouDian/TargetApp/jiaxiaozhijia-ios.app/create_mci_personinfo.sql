create table t_mci_person_info(
    row_id integer primary key autoincrement,
    auth_token text,
    avatar text,
    birthday text,
    check_type_b boolean,
    city_code integer,
    city_name text,
    create_time integer,
    desc text,
    gender text,
    home_page text,
    large_avatar text,
    mucang_id text,
    nickname text,
    password_set integer,
    phone text,
    valid_duration integer
)
