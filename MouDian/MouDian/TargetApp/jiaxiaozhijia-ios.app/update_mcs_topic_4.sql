
create table t_mcs_topic_list_data (row_id integer primary key autoincrement,topic_store_key text,data_string text);

create table t_mcs_publish_topic_data (row_id integer primary key autoincrement,user_id text,topic_type integer,data_string text);

create table t_mcs_general_data (row_id integer primary key autoincrement,store_key text,data_string text);
