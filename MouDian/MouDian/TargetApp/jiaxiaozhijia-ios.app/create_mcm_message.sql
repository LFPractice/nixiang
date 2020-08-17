create table t_mc_msg_base_model(
    row_id integer primary key autoincrement,
    post_time integer,
    group_type integer,
    show_type integer,
    counter_url text,
    item_id text,
    un_read_count integer,
    user_id text,
    event_name,
    extra text
);
