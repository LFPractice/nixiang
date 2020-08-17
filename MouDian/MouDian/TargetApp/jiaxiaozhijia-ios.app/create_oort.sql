create table t_mcc_oort_log(
	row_id integer primary key  autoincrement,
    log_id integer,
	_group text,
	event text,
	properties text,
	duration double,
	time_stamp datetime);