
create table t_mcs_reply (row_id integer primary key autoincrement, content_type integer,topic_id integer,reply_comment_id integer,content text, extra_data text,ori_image_list text);
create table t_mcs_supplement_question (row_id integer primary key autoincrement, topic_id integer,content text, extra_data text,ori_image_list text);