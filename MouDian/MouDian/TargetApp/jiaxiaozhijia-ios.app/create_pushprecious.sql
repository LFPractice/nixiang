
create table t_mcp_precious_data(
row_id integer primary key  autoincrement,
host text,
sign_key text,
enable_http boolean,
path_and_query text,
expire_time float,
params_string text
);
