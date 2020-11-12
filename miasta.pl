#!/usr/bin/env perl
use 5.012; # this enables strict
use warnings;
use utf8;
use Mojolicious::Lite;
use Mojo::SQLite;
use Mojolicious::Plugin::RemoteAddr;
plugin('RemoteAddr');
my $configpath = 'server.conf';
my $configfile = -f $configpath ? plugin Config => {file => $configpath} : {};
my $cfg = { 
	'mode'		=> $configfile->{mode}		|| 'production',
	'workers'	=> $configfile->{workers}	||  1,
	'port'		=> $configfile->{port}		|| 7000,
	'db'		=> $configfile->{db}		|| 'polska.db',
};

my $dbtime = (stat($cfg->{db}))[9];
app->secrets(['MIASTAPOLSKI']);
app->config( hypnotoad => { listen => ['http://*:'.$cfg->{port}], proxy => 1,workers => $cfg->{workers}} );
app->mode($cfg->{mode});
hook after_dispatch => sub { shift->res->headers->remove('Server'); };  
app->attr(sqlite => sub {
	state $sqlobject = Mojo::SQLite->new->from_filename($cfg->{db}, {ReadOnly   => 1, RaiseError => 1, PrintError => 1, no_wal => 1});		
	return $sqlobject;
});
any '/data.json' => sub {
	my $c = shift;
	my $pms  = $c->req->params;
	my $r = $c->req->params->param('q');
	# say "REQ: ".$r;
	my $dbh = $c->app->sqlite->db;
	my $ref = {};
	my $ip = '';
	$ip = $c->tx->remote_address."\t" if $c->tx->remote_address;
	# app->log->info($ip.join "\t", map{ $_.' '.$pms->param($_) } @{$pms->names});
	my $polish = qr/^[A-ZĄĆĘŁŃÓŚŹŻ\séà\-]+$/i;
	 
	# $r  = "pozn";
	if ($r =~ m/$polish/ and length($r) > 1){
		my $l = 50;
		# my $sql = "SELECT * FROM polska where name GLOB \"*".$r."*\" LIMIT ".$l;
		my $sql = "SELECT * FROM polska where name LIKE '%".$r."%' LIMIT ".$l;
		$ref = $dbh->query($sql);
		$ref = $ref->hashes->to_array if $ref;		
	}
	$c->render(json => $ref);
};
any '/' => sub { shift->reply->static("index.html"); };
app->start;
