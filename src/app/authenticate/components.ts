import { Component, OnInit } from '@angular/core';
import { AuthService } from './services';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'auth-signin',
  templateUrl: './templates/signin.html',
})
export class SigninComponent implements OnInit {
  is_loggedin = false;
  form = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(8), Validators.required]],
  });
  errors: any[] = [];
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  ngOnInit() {
    if (this.authService.checkAuthenticated()) {
      this.router.navigate(['']);
    }
  }
  onSubmit() {
    this.errors = [];
    this.authService
      .login(this.form.controls.email.value, this.form.controls.password.value)
      .subscribe(
        (result) => {},
        (error: any) => {
          if (Array.isArray(error.error)) {
            this.errors = error.error;
          } else if (typeof error.error.detail === 'string') {
            this.errors.push(error.error.detail);
          }
        }
      );
  }
}
