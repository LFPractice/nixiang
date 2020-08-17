create table t_mcc_call_phone_log(
	row_id integer primary key  autoincrement,
	log_Id integer,
	phone_number text,
	start_time text,
	group_name text,
    source text,
	label text,
	extra text,
	need_confirm integer,
	try_call_first integer,
	confirmed integer,
	duration integer,
    app_switch_interval integer);
