create table t_mcc_install_advert_app(
	row_id integer primary key  autoincrement,
	app_id text,
	app_name text,
	app_url text,
	download_url text);


create table t_mcc_install_advert_rule(
	row_id integer primary key  autoincrement,
	app_id text,
	button_url text,
	image_urls text,
	rule_id text,
	trigger text,
	trigger_value text,
	type integer,
    lanuch_count integer,
    load_count integer,
	last_lanuch_time date,
	disable integer,
    permanent_enable integer,
    content text
);

create table t_mcc_install_advert_log(
    row_id integer primary key  autoincrement,
    log_id integer,
    action text,
    rule_id integer,
    app_id text
);

create table t_mcc_install_advert_installing_log(
    app_id text primary key,
    rule_id integer,
    app_url text
);
