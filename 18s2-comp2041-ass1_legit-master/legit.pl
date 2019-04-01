#!/usr/bin/perl -w

use strict;
use File::Copy;
use File::Compare;
my $log_file =".legit/log";
my $source_dir = ".legit";
my $temp_dir =".legit/index";
my $status_file = ".legit/status";
if($ARGV[0] eq "init"){
	if( -d ".legit"){
		print "legit.pl: error: .legit already exists\n";
	}else{
		mkdir($source_dir);
		print "Initialized empty legit repository in .legit\n";
		exit 0;
	}
}
if($ARGV[0] eq "add"){
	shift @ARGV;
	if(! -d $source_dir){
		die "legit.pl: error: no .legit directory containing legit repository exists\n";
	}
	if(! -d $temp_dir){
		mkdir($temp_dir);
	}
	foreach my $file(@ARGV){
		if(! -e $file){
			if(-e "$temp_dir/$file"){
				unlink "$temp_dir/$file";
				next;
			}
			die "legit.pl: error: can not open '$file'\n";
		}
		copy($file,$temp_dir);
	}
	exit 0;
}
if($ARGV[0] eq "commit"){
	shift @ARGV;
	if($ARGV[0] eq "-a"){
		foreach my $file(glob "$temp_dir/*"){
			$file =~ /$temp_dir\/(.+)$/;
			my $file_name = $1;
			if(-e $file_name){
				copy($file_name,$temp_dir);
			}else{
				unlink "$temp_dir/$file_name";
			}
		}
        shift @ARGV;
    }
    shift @ARGV;
	my $count = find_commit();
	open FILE,">>",$log_file;
	print FILE "$count ",@ARGV,"\n";
	close FILE;
	my $flag = 0;
	my $pre_re = $count -1;
	my $empty_repo = 1;
	my $empty_index = 1;
	mkdir ("$source_dir/repository_$count");
	if($pre_re == -1){
		$flag = 1;
	}else{
		foreach my $file(glob "$source_dir/repository_$pre_re/*"){
			$empty_repo =0;
			$file =~ /$source_dir\/repository_$pre_re\/(.+)$/;
			my $file_name = $1;
			if(! -e "$temp_dir/$file_name"){
				$flag = 1;
				next;
			}
			if(compare("$file","$temp_dir/$file_name") != 0){
				$flag =1;
			}
		}
	}
	if($empty_repo ==1){
		foreach(glob "$temp_dir/*"){
			$empty_index =0;
		}
		if($empty_index ==0){
			$flag =1;
		}
	}
	
	if($flag == 0){
		rmdir ("$source_dir/repository_$count");
		print "nothing to commit\n";
	}else{
		foreach my $file(glob "$temp_dir/*"){
			copy("$file","$source_dir/repository_$count");
		}
		print "Committed as commit $count\n";
	}
	exit 0;
}
if($ARGV[0] eq "log"){
	my @array = ();
	open FILE,"<",$log_file or die "on file";
	while(my $line = <FILE>){
		push @array,$line;
	}
	close FILE;
	print reverse @array;
	exit 0;
}
if($ARGV[0] eq "show"){
	my $request = $ARGV[1];
	if($request =~ /^([0-9]+)\:(.+)$/){
		my $dir = $1;
		my $file = $2;
		if(! -d "$source_dir/repository_$dir"){
			die "legit.pl: error: unknown commit '$dir'\n"
		}
		open FILE,"<","$source_dir/repository_$dir/$file" or die "legit.pl: error: '$file' not found in commit $dir\n";
		while(my $line = <FILE>){
			print $line;
		}
		close FILE;
		exit 0;
	}
	if($request =~ /^\:(.+)$/){
		my $file = $1;
		my $count = find_commit();
		$count--;
		if($count == -1){
			die "error";
		}
		open FILE,"<","$temp_dir/$file" or die "legit.pl: error: '$file' not found in index\n";
		while(my $line = <FILE>){
			print $line;
		}
		close FILE;
		exit 0;
	}
	print "usage wrong";
	exit 1;
}
if($ARGV[0] eq "rm"){
	shift @ARGV;
	my $flag_f = 0;
	my $flag_c = 0;
	if($ARGV[0] eq "--force"){
		$flag_f = 1;
		shift @ARGV;
	}
	if($ARGV[0] eq "--cached"){
		$flag_c =1;
		shift @ARGV;
	}
	if($ARGV[0] eq "--force"){
		$flag_f = 1;
		shift @ARGV;
	}
	my $count = find_commit();
	$count--;
	foreach my $file(@ARGV){
		if(compare("$temp_dir/$file","$file") == 0 && $flag_f == 0 && $flag_c == 0){
			die "legit.pl: error: '$file' has changes staged in the index\n" if (! -e "$source_dir/repository_$count/$file");
			die "legit.pl: error: '$file' has changes staged in the index\n" if(compare("$temp_dir/$file","$source_dir/repository_$count/$file") != 0);
		}
		die "legit.pl: error: '$file' is not in the legit repository\n" if(! -e "$source_dir/repository_$count/$file" && $flag_c == 0 && $flag_f == 0);
		if(compare("$file","$source_dir/repository_$count/$file") != 0  && $flag_f == 0){
			if($flag_c == 0){
				die "legit.pl: error: '$file' in repository is different to working file\n" if(compare("$temp_dir/$file","$source_dir/repository_$count/$file") == 0);
				die "legit.pl: error: '$file' in index is different to both working file and repository\n";
			}
			if($flag_c == 1 ){
				if(compare("$temp_dir/$file","$file") != 0 && compare("$source_dir/repository_$count/$file","$temp_dir/$file") != 0){
					die "legit.pl: error: '$file' is not in the legit repository\n" if(! -e "$source_dir/repository_$count/$file");
					die "legit.pl: error: '$file' in index is different to both working file and repository\n";
				}
			}
		}
		die "legit.pl: error: '$file' is not in the legit repository\n" if($flag_f ==1 && ! -e "$temp_dir/$file" && -e "$file");	
		unlink $file if($flag_c == 0);
		unlink "$temp_dir/$file";
	}
}
if($ARGV[0] eq "status"){
	# my %status_dic = read_status();
	my $count = find_commit();
	$count--;
	my @index =();
	my @repo =();
	my @curr =();
	my %status_dic =();
	foreach my $file(glob "*"){
		if($file eq "legit.pl"){
			next;
		}
		push @curr,$file;
	}
	foreach my $file(glob "$temp_dir/*"){
		$file =~ /$temp_dir\/(.+)$/;
		my $file_name = $1;
		push @index,$file_name;
	}
	foreach my $file(glob "$source_dir/repository_$count/*"){
		$file =~ /$source_dir\/repository_$count\/(.+)$/;
		my $file_name = $1;
		push @repo,$file_name;
	}
	foreach my $file(@curr){
		if(! -e "$temp_dir/$file"){
			$status_dic{$file} = "untracked";
		}
	}
	foreach my $file(@index){
		if( -e "$source_dir/repository_$count/$file" && -e "$file" && compare("$file","$temp_dir/$file") ==0 && compare("$temp_dir/$file","$source_dir/repository_$count/$file") == 0 ){
			$status_dic{$file} = "same as repo";
		}
		if(! -e "$source_dir/repository_$count/$file" && -e "$file" && compare("$file","$temp_dir/$file") == 0){
			$status_dic{$file} = "added to index";
		}
		if(-e "$source_dir/repository_$count/$file" && -e "$file" && compare("$temp_dir/$file","$file") == 0 && compare("$temp_dir/$file","$source_dir/repository_$count/$file") != 0){
			$status_dic{$file} = "file changed, changes staged for commit";
		}
		if(-e "$source_dir/repository_$count/$file" && -e "$file" && compare("$temp_dir/$file","$file") != 0 && compare("$temp_dir/$file","$source_dir/repository_$count/$file") == 0){
			$status_dic{$file} = "file changed, changes not staged for commit";
		}
		if(-e "$source_dir/repository_$count/$file" && -e "$file" && compare("$temp_dir/$file","$file") != 0 && compare("$temp_dir/$file","$source_dir/repository_$count/$file") != 0 && compare("$file","$source_dir/repository_$count/$file") != 0 ){
			$status_dic{$file} = "file changed, different changes staged for commit";
		}
	}
	foreach my $file(@repo){
		if(! -e "$temp_dir/$file" && ! -e "$file"){
			$status_dic{$file} = "deleted";
		}
		if(-e "$temp_dir/$file" && ! -e "$file"){
			$status_dic{$file} = "file deleted";
		}
	}
	foreach my $file(sort keys %status_dic){
		print "$file - $status_dic{$file}\n";
	}
}
sub find_commit{
	my ($temp) = @_;
	my $count = 0;
	while($count >= 0){
		if (-d "$source_dir/repository_$count"){
			$count++;
		}else{
			last;
		}
	}
	return $count;
}
