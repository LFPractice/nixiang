drop table t_mcc_install_advert_log;

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